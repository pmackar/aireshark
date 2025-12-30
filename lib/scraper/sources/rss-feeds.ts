import Parser from "rss-parser";
import { scrapePageContent } from "../browser";
import { extractFromArticle, classifyArticleRelevance } from "../extractor";
import prisma from "@/lib/db";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; aireshark/1.0)",
  },
});

interface RssFeedConfig {
  name: string;
  url: string;
  sourceType: "rss_news" | "rss_press";
}

// RSS feeds for HVAC industry news
const RSS_FEEDS: RssFeedConfig[] = [
  {
    name: "ACHR News - Main",
    url: "https://www.achrnews.com/rss/16",
    sourceType: "rss_news",
  },
  {
    name: "ACHR News - Breaking",
    url: "https://www.achrnews.com/rss/topic/2722",
    sourceType: "rss_news",
  },
  {
    name: "ACHR News - Business",
    url: "https://www.achrnews.com/rss/topic/2240",
    sourceType: "rss_news",
  },
  {
    name: "Supply House Times",
    url: "https://www.supplyht.com/rss",
    sourceType: "rss_news",
  },
];

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
}

interface RssResult {
  feedName: string;
  articlesFound: number;
  articlesStored: number;
  errors: string[];
}

export async function fetchRssFeed(url: string): Promise<RssItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items || [];
  } catch (error) {
    console.error(`Error fetching RSS feed ${url}:`, error);
    return [];
  }
}

export async function processRssItem(
  item: RssItem,
  feedName: string
): Promise<boolean> {
  if (!item.link || !item.title) {
    return false;
  }

  try {
    // Check if already processed
    const existing = await prisma.article.findUnique({
      where: { url: item.link },
    });

    if (existing) {
      return false;
    }

    // Quick relevance check using title and snippet
    const snippet = item.contentSnippet || item.content || "";
    const relevance = await classifyArticleRelevance(item.title, snippet.slice(0, 500));

    if (!relevance.isRelevant || relevance.confidence < 40) {
      console.log(`[RSS] Not relevant: ${item.title.slice(0, 60)}...`);
      return false;
    }

    console.log(`[RSS] Processing relevant article: ${item.title.slice(0, 60)}...`);

    // Scrape full article content
    const pageContent = await scrapePageContent(item.link);
    if (!pageContent) {
      console.log(`[RSS] Failed to scrape: ${item.link}`);
      return false;
    }

    // Extract structured data using OpenAI
    const extracted = await extractFromArticle(pageContent.content, item.link);
    if (!extracted || !extracted.isRelevant) {
      return false;
    }

    // Find matching platform or PE firm
    let platformId: string | null = null;
    let peFirmId: string | null = null;

    if (extracted.peFirmMentions.length > 0) {
      // First try to find a matching platform
      const platform = await prisma.platform.findFirst({
        where: {
          OR: extracted.peFirmMentions.map((name) => ({
            name: { contains: name, mode: "insensitive" as const },
          })),
        },
      });

      if (platform) {
        platformId = platform.id;
        peFirmId = platform.privateEquityFirmId;
      } else {
        // Fall back to PE firm
        const peFirm = await prisma.privateEquityFirm.findFirst({
          where: {
            OR: extracted.peFirmMentions.map((name) => ({
              name: { contains: name, mode: "insensitive" as const },
            })),
          },
        });
        peFirmId = peFirm?.id || null;
      }
    }

    // Store article
    await prisma.article.create({
      data: {
        title: extracted.title || item.title,
        url: item.link,
        source: feedName,
        summary: extracted.summary,
        publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        platformId,
        privateEquityFirmId: peFirmId,
      },
    });

    console.log(`[RSS] Stored: ${item.title.slice(0, 60)}...`);

    // Process any acquisitions found
    for (const acq of extracted.acquisitions) {
      if (acq.relevanceScore >= 70 && acq.peFirmName && acq.acquiredCompanyName) {
        await processAcquisitionFromRss(acq, item.link, platformId);
      }
    }

    return true;
  } catch (error) {
    console.error(`[RSS] Error processing ${item.link}:`, error);
    return false;
  }
}

async function processAcquisitionFromRss(
  acq: {
    peFirmName: string | null;
    acquiredCompanyName: string | null;
    acquisitionDate: string | null;
    dealAmount: string | null;
    location: string | null;
    summary: string;
  },
  sourceUrl: string,
  platformId: string | null
): Promise<void> {
  if (!acq.peFirmName || !acq.acquiredCompanyName) return;

  try {
    // Find PE firm or platform
    let peFirm = await prisma.privateEquityFirm.findFirst({
      where: {
        name: { contains: acq.peFirmName, mode: "insensitive" },
      },
    });

    let platform = platformId
      ? await prisma.platform.findUnique({ where: { id: platformId } })
      : await prisma.platform.findFirst({
          where: {
            name: { contains: acq.peFirmName, mode: "insensitive" },
          },
        });

    // Need at least one to link to
    if (!peFirm && !platform) {
      console.log(`[RSS] No matching PE firm or platform for: ${acq.peFirmName}`);
      return;
    }

    // Use platform's PE firm if we found a platform
    if (platform && !peFirm && platform.privateEquityFirmId) {
      peFirm = await prisma.privateEquityFirm.findUnique({
        where: { id: platform.privateEquityFirmId },
      });
    }

    if (!peFirm) {
      console.log(`[RSS] No PE firm found for acquisition: ${acq.acquiredCompanyName}`);
      return;
    }

    // Create or find brand
    const slug = acq.acquiredCompanyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let brand = await prisma.brand.findUnique({ where: { slug } });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: acq.acquiredCompanyName,
          slug,
          location: acq.location,
          acquisitionDate: acq.acquisitionDate
            ? new Date(acq.acquisitionDate)
            : new Date(),
          acquisitionPrice: acq.dealAmount,
          privateEquityFirmId: peFirm.id,
          platformId: platform?.id,
        },
      });
      console.log(`[RSS] Created brand: ${brand.name}`);
    }

    // Check for existing acquisition
    const existingAcq = await prisma.acquisition.findFirst({
      where: {
        privateEquityFirmId: peFirm.id,
        brandId: brand.id,
      },
    });

    if (!existingAcq) {
      await prisma.acquisition.create({
        data: {
          date: acq.acquisitionDate ? new Date(acq.acquisitionDate) : new Date(),
          amount: acq.dealAmount,
          dealType: "acquisition",
          sourceUrl,
          privateEquityFirmId: peFirm.id,
          platformId: platform?.id,
          brandId: brand.id,
          notes: acq.summary,
        },
      });
      console.log(`[RSS] Created acquisition: ${peFirm.name} → ${brand.name}`);
    }
  } catch (error) {
    console.error("[RSS] Error processing acquisition:", error);
  }
}

async function logScrapeResult(
  sourceId: string,
  startedAt: Date,
  result: RssResult
): Promise<void> {
  try {
    await prisma.scrapeLog.create({
      data: {
        sourceId,
        startedAt,
        completedAt: new Date(),
        status: result.errors.length > 0 ? "partial" : "success",
        recordsFound: result.articlesFound,
        recordsNew: result.articlesStored,
        errorMessage: result.errors.length > 0 ? result.errors.join("; ") : null,
      },
    });

    // Update source last scraped time
    await prisma.scrapeSource.update({
      where: { id: sourceId },
      data: {
        lastScrapedAt: new Date(),
        lastSuccessAt: result.errors.length === 0 ? new Date() : undefined,
        consecutiveFailures:
          result.errors.length > 0
            ? { increment: 1 }
            : 0,
      },
    });
  } catch (error) {
    console.error("[RSS] Error logging scrape result:", error);
  }
}

export async function runRssFeedScraper(): Promise<{
  totalArticlesFound: number;
  totalArticlesStored: number;
  feedResults: RssResult[];
  errors: string[];
}> {
  console.log("[RSS] Starting RSS feed scraper...");

  const feedResults: RssResult[] = [];
  const errors: string[] = [];
  let totalFound = 0;
  let totalStored = 0;

  for (const feed of RSS_FEEDS) {
    const startedAt = new Date();
    console.log(`[RSS] Fetching: ${feed.name}`);

    const result: RssResult = {
      feedName: feed.name,
      articlesFound: 0,
      articlesStored: 0,
      errors: [],
    };

    try {
      // Ensure ScrapeSource exists
      let source = await prisma.scrapeSource.findFirst({
        where: { url: feed.url },
      });

      if (!source) {
        source = await prisma.scrapeSource.create({
          data: {
            name: feed.name,
            url: feed.url,
            sourceType: feed.sourceType,
            scrapeFrequencyHours: 6,
            isActive: true,
          },
        });
      }

      // Fetch RSS items
      const items = await fetchRssFeed(feed.url);
      result.articlesFound = items.length;
      totalFound += items.length;

      console.log(`[RSS] Found ${items.length} items in ${feed.name}`);

      // Process each item (limit to recent 20 to avoid overload)
      const recentItems = items.slice(0, 20);

      for (const item of recentItems) {
        const stored = await processRssItem(item, feed.name);
        if (stored) {
          result.articlesStored++;
          totalStored++;
        }

        // Rate limiting between articles
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Log result
      await logScrapeResult(source.id, startedAt, result);
    } catch (error) {
      const errorMsg = `Feed ${feed.name}: ${error}`;
      console.error(`[RSS] ${errorMsg}`);
      result.errors.push(errorMsg);
      errors.push(errorMsg);
    }

    feedResults.push(result);

    // Rate limiting between feeds
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`[RSS] Complete: Found ${totalFound}, Stored ${totalStored}`);

  return {
    totalArticlesFound: totalFound,
    totalArticlesStored: totalStored,
    feedResults,
    errors,
  };
}

export async function runSingleRssFeed(feedUrl: string): Promise<RssResult> {
  const startedAt = new Date();

  const result: RssResult = {
    feedName: feedUrl,
    articlesFound: 0,
    articlesStored: 0,
    errors: [],
  };

  try {
    const items = await fetchRssFeed(feedUrl);
    result.articlesFound = items.length;

    for (const item of items.slice(0, 10)) {
      const stored = await processRssItem(item, "Custom Feed");
      if (stored) {
        result.articlesStored++;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    result.errors.push(`${error}`);
  }

  return result;
}
