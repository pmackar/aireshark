import { NextRequest, NextResponse } from "next/server";
import {
  runAllScrapers,
  runNewsScrapeOnly,
  runGoogleScrapeOnly,
  runPortfolioScrapeOnly,
  runRssScrapeOnly,
  runPlatformMonitorOnly,
  runGmailScrapeOnly,
} from "@/lib/scraper";
import { isUserAdmin } from "@/lib/auth";

// Authentication - API key OR admin user session
async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Check API key first (support both key names) - used by cron jobs
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.AIRESHARK_API_KEY || process.env.SCRAPER_API_KEY;

  if (expectedKey && expectedKey.trim() !== "" && apiKey === expectedKey) {
    return true;
  }

  // Check for valid admin user session (from /admin dashboard)
  if (await isUserAdmin()) {
    return true;
  }

  // In development without API key, allow localhost access
  const host = request.headers.get("host") || "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const hasApiKey = expectedKey && expectedKey.trim() !== "";

    // Only allow if no API key is configured (pure development)
    if (!hasApiKey) {
      console.warn("No API key configured - allowing localhost access");
      return true;
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  // Check authorization
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { type = "all" } = body as { type?: string };

    let result;

    switch (type) {
      case "news":
        console.log("Running news scraper only...");
        result = await runNewsScrapeOnly();
        break;

      case "google":
        console.log("Running Google News scraper only...");
        result = await runGoogleScrapeOnly();
        break;

      case "portfolio":
        console.log("Running portfolio scraper only...");
        result = await runPortfolioScrapeOnly();
        break;

      case "rss":
        console.log("Running RSS feed scraper only...");
        result = await runRssScrapeOnly();
        break;

      case "platforms":
        console.log("Running platform monitor only...");
        result = await runPlatformMonitorOnly();
        break;

      case "gmail":
        console.log("Running Gmail alerts scraper only...");
        result = await runGmailScrapeOnly();
        break;

      case "all":
      default:
        console.log("Running all scrapers...");
        result = await runAllScrapers();
        break;
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scraper error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // GET request returns scraper status/info
  return NextResponse.json({
    status: "ready",
    availableTypes: ["all", "news", "google", "portfolio", "rss", "platforms", "gmail"],
    usage: {
      method: "POST",
      body: { type: "all | news | google | portfolio | rss | platforms | gmail" },
      headers: { "x-api-key": "your-api-key (if SCRAPER_API_KEY is set)" },
    },
    endpoints: {
      "/api/scrape": "Trigger scraping (POST)",
      "/api/scrape/status": "Get last scrape status (GET)",
    },
  });
}
