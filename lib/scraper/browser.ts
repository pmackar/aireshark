import puppeteer, { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function scrapePageContent(url: string): Promise<{
  title: string;
  content: string;
  html: string;
} | null> {
  const browser = await getBrowser();
  let page: Page | null = null;

  try {
    page = await browser.newPage();

    // Set a reasonable viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait a bit for dynamic content
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Extract title
    const title = await page.title();

    // Extract main content text
    const content = await page.evaluate(() => {
      // Remove script, style, nav, header, footer elements
      const elementsToRemove = document.querySelectorAll(
        "script, style, nav, header, footer, aside, .sidebar, .advertisement, .ad, .social-share"
      );
      elementsToRemove.forEach((el) => el.remove());

      // Try to find the main content area
      const mainContent =
        document.querySelector("article") ||
        document.querySelector("main") ||
        document.querySelector(".content") ||
        document.querySelector(".post-content") ||
        document.querySelector(".article-body") ||
        document.body;

      return mainContent?.textContent?.replace(/\s+/g, " ").trim() || "";
    });

    const html = await page.content();

    return { title, content, html };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  } finally {
    if (page) {
      await page.close();
    }
  }
}

export async function scrapeMultiplePages(
  urls: string[]
): Promise<Map<string, { title: string; content: string } | null>> {
  const results = new Map<string, { title: string; content: string } | null>();

  // Process in batches of 3 to avoid overwhelming the browser
  const batchSize = 3;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(async (url) => {
      const result = await scrapePageContent(url);
      results.set(url, result ? { title: result.title, content: result.content } : null);
    });
    await Promise.all(promises);
  }

  return results;
}
