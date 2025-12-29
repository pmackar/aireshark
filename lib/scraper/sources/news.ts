import * as cheerio from "cheerio";
import { scrapePageContent } from "../browser";
import { extractFromArticle, classifyArticleRelevance } from "../extractor";
import prisma from "@/lib/db";

interface NewsSource {
  name: string;
  baseUrl: string;
  searchUrl: (query: string) => string;
  articleSelector: string;
  titleSelector: string;
  linkSelector: string;
  snippetSelector?: string;
}

const NEWS_SOURCES: NewsSource[] = [
  {
    name: "ACHR News",
    baseUrl: "https://www.achrnews.com",
    searchUrl: (query) =>
      `https://www.achrnews.com/search?q=${encodeURIComponent(query)}`,
    articleSelector: ".search-result, .article-item, article",
    titleSelector: "h2 a, h3 a, .title a",
    linkSelector: "h2 a, h3 a, .title a",
    snippetSelector: ".excerpt, .summary, p",
  },
  {
    name: "Contracting Business",
    baseUrl: "https://www.contractingbusiness.com",
    searchUrl: (query) =>
      `https://www.contractingbusiness.com/search?q=${encodeURIComponent(query)}`,
    articleSelector: ".search-result, .article-item, article",
    titleSelector: "h2 a, h3 a, .title a",
    linkSelector: "h2 a, h3 a, .title a",
    snippetSelector: ".excerpt, .summary, p",
  },
  {
    name: "PR Newswire",
    baseUrl: "https://www.prnewswire.com",
    searchUrl: (query) =>
      `https://www.prnewswire.com/search/news/?keyword=${encodeURIComponent(query)}&page=1&pagesize=25`,
    articleSelector: ".newscard, .card, article",
    titleSelector: "h3 a, h2 a, .title a",
    linkSelector: "h3 a, h2 a, .title a",
    snippetSelector: ".sub-title, .excerpt, p",
  },
  {
    name: "Business Wire",
    baseUrl: "https://www.businesswire.com",
    searchUrl: (query) =>
      `https://www.businesswire.com/portal/site/home/search/?searchTerm=${encodeURIComponent(query)}`,
    articleSelector: ".bw-news-item, .search-result, article",
    titleSelector: "h3 a, h2 a, .title a",
    linkSelector: "h3 a, h2 a, .title a",
    snippetSelector: ".bw-news-summary, .excerpt, p",
  },
];

const SEARCH_QUERIES = [
  "HVAC acquisition private equity",
  "HVAC company acquisition",
  "plumbing acquisition private equity",
  "home services acquisition",
  "Apex Service Partners acquisition",
  "Wrench Group acquisition",
  "Redwood Services acquisition",
  "HVAC consolidation",
  "residential services M&A",
];

export interface ScrapedArticle {
  title: string;
  url: string;
  source: string;
  snippet?: string;
  content?: string;
}

export async function scrapeNewsSource(
  source: NewsSource,
  query: string
): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];

  try {
    const searchUrl = source.searchUrl(query);
    const result = await scrapePageContent(searchUrl);

    if (!result) {
      console.log(`Failed to scrape ${source.name} for query: ${query}`);
      return articles;
    }

    const $ = cheerio.load(result.html);

    $(source.articleSelector).each((_, element) => {
      const $el = $(element);
      const titleEl = $el.find(source.titleSelector).first();
      const title = titleEl.text().trim();
      let link = titleEl.attr("href") || $el.find(source.linkSelector).attr("href");
      const snippet = source.snippetSelector
        ? $el.find(source.snippetSelector).first().text().trim()
        : undefined;

      if (title && link) {
        // Make sure link is absolute
        if (link.startsWith("/")) {
          link = source.baseUrl + link;
        }

        articles.push({
          title,
          url: link,
          source: source.name,
          snippet,
        });
      }
    });

    console.log(
      `Found ${articles.length} articles from ${source.name} for query: ${query}`
    );
  } catch (error) {
    console.error(`Error scraping ${source.name}:`, error);
  }

  return articles;
}

export async function scrapeAllNewsSources(): Promise<ScrapedArticle[]> {
  const allArticles: ScrapedArticle[] = [];
  const seenUrls = new Set<string>();

  for (const source of NEWS_SOURCES) {
    for (const query of SEARCH_QUERIES.slice(0, 3)) {
      // Limit queries per source
      const articles = await scrapeNewsSource(source, query);

      for (const article of articles) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          allArticles.push(article);
        }
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return allArticles;
}

export async function processAndStoreArticle(
  article: ScrapedArticle
): Promise<boolean> {
  try {
    // Check if article already exists
    const existing = await prisma.article.findUnique({
      where: { url: article.url },
    });

    if (existing) {
      console.log(`Article already exists: ${article.url}`);
      return false;
    }

    // First, classify if it's relevant
    const relevance = await classifyArticleRelevance(
      article.title,
      article.snippet || ""
    );

    if (!relevance.isRelevant || relevance.confidence < 50) {
      console.log(`Article not relevant: ${article.title}`);
      return false;
    }

    // Scrape full content
    const pageContent = await scrapePageContent(article.url);
    if (!pageContent) {
      console.log(`Could not scrape article content: ${article.url}`);
      return false;
    }

    // Extract structured data
    const extracted = await extractFromArticle(pageContent.content, article.url);
    if (!extracted || !extracted.isRelevant) {
      console.log(`Extraction not relevant: ${article.url}`);
      return false;
    }

    // Find matching PE firm if mentioned
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

    // Find matching brand if mentioned
    let brandId: string | null = null;
    if (extracted.brandMentions.length > 0) {
      const brand = await prisma.brand.findFirst({
        where: {
          OR: extracted.brandMentions.map((name) => ({
            name: { contains: name, mode: "insensitive" as const },
          })),
        },
      });
      brandId = brand?.id || null;
    }

    // Store the article
    await prisma.article.create({
      data: {
        title: extracted.title || article.title,
        url: article.url,
        source: article.source,
        summary: extracted.summary,
        publishedDate: new Date(),
        privateEquityFirmId: peFirmId,
        brandId: brandId,
      },
    });

    console.log(`Stored article: ${article.title}`);

    // Process any acquisitions found
    for (const acq of extracted.acquisitions) {
      if (acq.relevanceScore >= 70 && acq.peFirmName && acq.acquiredCompanyName) {
        await processAcquisition(acq);
      }
    }

    return true;
  } catch (error) {
    console.error(`Error processing article ${article.url}:`, error);
    return false;
  }
}

async function processAcquisition(acq: {
  peFirmName: string | null;
  acquiredCompanyName: string | null;
  acquisitionDate: string | null;
  dealAmount: string | null;
  location: string | null;
  summary: string;
}): Promise<void> {
  if (!acq.peFirmName || !acq.acquiredCompanyName) return;

  try {
    // Find or skip if PE firm doesn't exist
    const peFirm = await prisma.privateEquityFirm.findFirst({
      where: {
        name: { contains: acq.peFirmName, mode: "insensitive" },
      },
    });

    if (!peFirm) {
      console.log(`PE firm not found: ${acq.peFirmName}`);
      return;
    }

    // Create slug from company name
    const slug = acq.acquiredCompanyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if brand exists
    let brand = await prisma.brand.findUnique({ where: { slug } });

    if (!brand) {
      // Create new brand
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
      console.log(`Created new brand: ${brand.name}`);
    }

    // Check if acquisition record exists
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
          privateEquityFirmId: peFirm.id,
          brandId: brand.id,
          notes: acq.summary,
        },
      });
      console.log(`Created acquisition record: ${peFirm.name} -> ${brand.name}`);
    }
  } catch (error) {
    console.error("Error processing acquisition:", error);
  }
}

export async function runNewsScraper(): Promise<{
  articlesFound: number;
  articlesStored: number;
}> {
  console.log("Starting news scraper...");

  const articles = await scrapeAllNewsSources();
  console.log(`Found ${articles.length} total articles`);

  let stored = 0;
  for (const article of articles) {
    const success = await processAndStoreArticle(article);
    if (success) stored++;

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log(`Stored ${stored} new articles`);
  return { articlesFound: articles.length, articlesStored: stored };
}
