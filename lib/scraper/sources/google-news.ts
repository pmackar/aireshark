import { scrapePageContentLite } from "../browser";
import { extractFromArticle, classifyArticleRelevance } from "../extractor";
import prisma from "@/lib/db";

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  source?: string;
}

interface GoogleSearchResponse {
  items?: Array<{
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
  }>;
  searchInformation?: {
    totalResults: string;
  };
}

const SEARCH_QUERIES = [
  // Core PE + trade queries
  '"private equity" HVAC acquisition',
  '"private equity" plumbing acquisition',
  '"private equity" electrical contractor acquisition',
  '"private equity" home services',

  // Major platforms
  "Apex Service Partners acquisition",
  "Wrench Group acquisition",
  "Sila Services acquisition",
  "Redwood Services acquisition",
  "Service Experts acquisition",
  "Horizon Services acquisition",
  "Lee Company HVAC acquisition",

  // Major PE firms in the space
  '"Alpine Investors" HVAC',
  '"Leonard Green" home services',
  '"Roark Capital" HVAC',
  '"Partners Group" residential services',

  // Deal types
  "HVAC company acquired",
  "HVAC M&A deal",
  "HVAC company merger",
  "plumbing company merger acquisition",
  "home services consolidation",
  "residential services platform acquisition",

  // Industry news
  "HVAC contractor sold private equity",
  "plumbing contractor acquired",
  "home services roll-up",
];

export async function searchGoogleNews(
  query: string
): Promise<GoogleSearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.log("Google API credentials not configured, skipping Google search");
    return [];
  }

  try {
    // Add "news" and date filter for recent articles
    const fullQuery = `${query} when:30d`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(fullQuery)}&num=10&sort=date`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Google API error: ${response.status}`);
      return [];
    }

    const data: GoogleSearchResponse = await response.json();

    if (!data.items) {
      return [];
    }

    return data.items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: item.displayLink,
    }));
  } catch (error) {
    console.error("Error searching Google:", error);
    return [];
  }
}

export async function runGoogleNewsScraper(): Promise<{
  articlesFound: number;
  articlesStored: number;
}> {
  console.log("Starting Google News scraper...");

  const allResults: GoogleSearchResult[] = [];
  const seenUrls = new Set<string>();

  for (const query of SEARCH_QUERIES) {
    console.log(`Searching: ${query}`);
    const results = await searchGoogleNews(query);

    for (const result of results) {
      if (!seenUrls.has(result.link)) {
        seenUrls.add(result.link);
        allResults.push(result);
      }
    }

    // Rate limiting - Google API has quota limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`Found ${allResults.length} unique articles from Google`);

  let stored = 0;
  for (const result of allResults) {
    const success = await processGoogleResult(result);
    if (success) stored++;

    // Rate limiting for scraping
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log(`Stored ${stored} new articles from Google`);
  return { articlesFound: allResults.length, articlesStored: stored };
}

async function processGoogleResult(result: GoogleSearchResult): Promise<boolean> {
  try {
    // Check if already exists
    const existing = await prisma.article.findUnique({
      where: { url: result.link },
    });

    if (existing) {
      return false;
    }

    // Quick relevance check
    const relevance = await classifyArticleRelevance(result.title, result.snippet);
    if (!relevance.isRelevant || relevance.confidence < 40) {
      console.log(`Not relevant: ${result.title}`);
      return false;
    }

    // Scrape full content (using lightweight fetch-based scraper for serverless)
    const pageContent = await scrapePageContentLite(result.link);
    if (!pageContent) {
      return false;
    }

    // Extract structured data
    const extracted = await extractFromArticle(pageContent.content, result.link);
    if (!extracted || !extracted.isRelevant) {
      return false;
    }

    // Find matching PE firm
    let peFirmId: string | null = null;
    if (extracted.peFirmMentions.length > 0) {
      const peFirm = await prisma.privateEquityFirm.findFirst({
        where: {
          OR: extracted.peFirmMentions.map((name) => ({
            name: { contains: name, mode: "insensitive" as const },
          })),
        },
      });
      peFirmId = peFirm?.id || null;
    }

    // Store article
    await prisma.article.create({
      data: {
        title: extracted.title || result.title,
        url: result.link,
        source: result.source || "Google News",
        summary: extracted.summary,
        publishedDate: new Date(),
        privateEquityFirmId: peFirmId,
      },
    });

    console.log(`Stored: ${result.title}`);

    // Process acquisitions
    for (const acq of extracted.acquisitions) {
      if (acq.relevanceScore >= 70 && acq.peFirmName && acq.acquiredCompanyName) {
        await processAcquisitionFromGoogle(acq);
      }
    }

    return true;
  } catch (error) {
    console.error(`Error processing ${result.link}:`, error);
    return false;
  }
}

async function processAcquisitionFromGoogle(acq: {
  peFirmName: string | null;
  acquiredCompanyName: string | null;
  acquisitionDate: string | null;
  dealAmount: string | null;
  location: string | null;
  summary: string;
}): Promise<void> {
  if (!acq.peFirmName || !acq.acquiredCompanyName) return;

  try {
    const peFirm = await prisma.privateEquityFirm.findFirst({
      where: {
        name: { contains: acq.peFirmName, mode: "insensitive" },
      },
    });

    if (!peFirm) return;

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
        },
      });
      console.log(`Created brand: ${brand.name}`);
    }

    const existingAcq = await prisma.acquisition.findFirst({
      where: { privateEquityFirmId: peFirm.id, brandId: brand.id },
    });

    if (!existingAcq) {
      await prisma.acquisition.create({
        data: {
          date: acq.acquisitionDate ? new Date(acq.acquisitionDate) : new Date(),
          amount: acq.dealAmount,
          dealType: "acquisition",
          privateEquityFirmId: peFirm.id,
          brandId: brand.id,
          notes: acq.summary,
        },
      });
    }
  } catch (error) {
    console.error("Error processing acquisition:", error);
  }
}

// Alternative: Scrape Google News directly (no API key needed, but less reliable)
export async function scrapeGoogleNewsDirect(query: string): Promise<GoogleSearchResult[]> {
  const results: GoogleSearchResult[] = [];

  try {
    const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const pageContent = await scrapePageContentLite(searchUrl);

    if (!pageContent) {
      return results;
    }

    // Google News uses dynamic rendering, so direct scraping is limited
    // The API approach above is more reliable
    console.log("Note: Direct Google News scraping has limited results");

    return results;
  } catch (error) {
    console.error("Error scraping Google News directly:", error);
    return results;
  }
}
