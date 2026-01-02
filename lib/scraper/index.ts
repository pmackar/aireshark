import { closeBrowser } from "./browser";
import { runNewsScraper } from "./sources/news";
import { runGoogleNewsScraper } from "./sources/google-news";
import { runPortfolioScraper } from "./sources/portfolio";
import { runRssFeedScraper } from "./sources/rss-feeds";
import { runPlatformMonitor } from "./sources/platform-monitor";
import { runGmailAlertsScraper, isGmailConfigured } from "./sources/gmail-alerts";

export interface ScraperResult {
  news: {
    articlesFound: number;
    articlesStored: number;
  };
  google: {
    articlesFound: number;
    articlesStored: number;
  };
  rss: {
    articlesFound: number;
    articlesStored: number;
  };
  portfolio: {
    firmsScraped: number;
    totalBrandsFound: number;
    totalBrandsAdded: number;
  };
  duration: number;
  errors: string[];
}

export async function runAllScrapers(): Promise<ScraperResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  let newsResult = { articlesFound: 0, articlesStored: 0 };
  let googleResult = { articlesFound: 0, articlesStored: 0 };
  let rssResult = { articlesFound: 0, articlesStored: 0 };
  let portfolioResult = { firmsScraped: 0, totalBrandsFound: 0, totalBrandsAdded: 0 };

  try {
    console.log("=== Starting full scrape ===");

    // Run news scraper
    try {
      newsResult = await runNewsScraper();
    } catch (error) {
      const msg = `News scraper error: ${error}`;
      console.error(msg);
      errors.push(msg);
    }

    // Run Google News scraper
    try {
      googleResult = await runGoogleNewsScraper();
    } catch (error) {
      const msg = `Google News scraper error: ${error}`;
      console.error(msg);
      errors.push(msg);
    }

    // Run RSS feed scraper
    try {
      const rssFullResult = await runRssFeedScraper();
      rssResult = {
        articlesFound: rssFullResult.totalArticlesFound,
        articlesStored: rssFullResult.totalArticlesStored,
      };
      errors.push(...rssFullResult.errors);
    } catch (error) {
      const msg = `RSS scraper error: ${error}`;
      console.error(msg);
      errors.push(msg);
    }

    // Run portfolio scraper
    try {
      portfolioResult = await runPortfolioScraper();
    } catch (error) {
      const msg = `Portfolio scraper error: ${error}`;
      console.error(msg);
      errors.push(msg);
    }

    console.log("=== Scrape complete ===");
  } finally {
    // Always close the browser when done
    await closeBrowser();
  }

  return {
    news: newsResult,
    google: googleResult,
    rss: rssResult,
    portfolio: portfolioResult,
    duration: Date.now() - startTime,
    errors,
  };
}

export async function runNewsScrapeOnly(): Promise<{
  articlesFound: number;
  articlesStored: number;
  duration: number;
}> {
  const startTime = Date.now();
  try {
    const result = await runNewsScraper();
    return { ...result, duration: Date.now() - startTime };
  } finally {
    await closeBrowser();
  }
}

export async function runGoogleScrapeOnly(): Promise<{
  articlesFound: number;
  articlesStored: number;
  duration: number;
}> {
  const startTime = Date.now();
  try {
    const result = await runGoogleNewsScraper();
    return { ...result, duration: Date.now() - startTime };
  } finally {
    await closeBrowser();
  }
}

export async function runPortfolioScrapeOnly(): Promise<{
  firmsScraped: number;
  totalBrandsFound: number;
  totalBrandsAdded: number;
  duration: number;
}> {
  const startTime = Date.now();
  try {
    const result = await runPortfolioScraper();
    return { ...result, duration: Date.now() - startTime };
  } finally {
    await closeBrowser();
  }
}

export async function runRssScrapeOnly(): Promise<{
  totalArticlesFound: number;
  totalArticlesStored: number;
  feedResults: Array<{ feedName: string; articlesFound: number; articlesStored: number }>;
  duration: number;
}> {
  const startTime = Date.now();
  try {
    const result = await runRssFeedScraper();
    return { ...result, duration: Date.now() - startTime };
  } finally {
    await closeBrowser();
  }
}

export async function runPlatformMonitorOnly(): Promise<{
  platformsMonitored: number;
  totalBrandsFound: number;
  totalBrandsAdded: number;
  totalBrandsRemoved: number;
  duration: number;
}> {
  const startTime = Date.now();
  try {
    const result = await runPlatformMonitor();
    return {
      platformsMonitored: result.platformsMonitored,
      totalBrandsFound: result.totalBrandsFound,
      totalBrandsAdded: result.totalBrandsAdded,
      totalBrandsRemoved: result.totalBrandsRemoved,
      duration: Date.now() - startTime,
    };
  } finally {
    await closeBrowser();
  }
}

export async function runGmailScrapeOnly(): Promise<{
  emailsProcessed: number;
  articlesFound: number;
  articlesStored: number;
  skipReasons: {
    duplicate: number;
    scrape_failed: number;
    not_relevant: number;
    extraction_failed: number;
    error: number;
  };
  duration: number;
}> {
  const startTime = Date.now();
  try {
    const result = await runGmailAlertsScraper();
    return { ...result, duration: Date.now() - startTime };
  } finally {
    await closeBrowser();
  }
}

// Export individual components for use elsewhere
export { extractFromArticle, classifyArticleRelevance } from "./extractor";
export { scrapePageContent, scrapePageContentLite } from "./browser";
export { updateFirmPortfolio } from "./sources/portfolio";
export { runRssFeedScraper } from "./sources/rss-feeds";
export { runPlatformMonitor, monitorPlatform } from "./sources/platform-monitor";
export { runGmailAlertsScraper, isGmailConfigured } from "./sources/gmail-alerts";
