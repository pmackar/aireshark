import { closeBrowser } from "./browser";
import { runNewsScraper } from "./sources/news";
import { runGoogleNewsScraper } from "./sources/google-news";
import { runPortfolioScraper } from "./sources/portfolio";

export interface ScraperResult {
  news: {
    articlesFound: number;
    articlesStored: number;
  };
  google: {
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

// Export individual components for use elsewhere
export { extractFromArticle, classifyArticleRelevance } from "./extractor";
export { scrapePageContent } from "./browser";
export { updateFirmPortfolio } from "./sources/portfolio";
