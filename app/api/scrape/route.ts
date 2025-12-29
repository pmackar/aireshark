import { NextRequest, NextResponse } from "next/server";
import {
  runAllScrapers,
  runNewsScrapeOnly,
  runGoogleScrapeOnly,
  runPortfolioScrapeOnly,
} from "@/lib/scraper";

// Simple API key authentication
function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.SCRAPER_API_KEY;

  // If no key is configured, allow requests (for development)
  if (!expectedKey) {
    console.warn("SCRAPER_API_KEY not set - allowing unauthenticated access");
    return true;
  }

  return apiKey === expectedKey;
}

export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
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
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // GET request returns scraper status/info
  return NextResponse.json({
    status: "ready",
    availableTypes: ["all", "news", "google", "portfolio"],
    usage: {
      method: "POST",
      body: { type: "all | news | google | portfolio" },
      headers: { "x-api-key": "your-api-key (if SCRAPER_API_KEY is set)" },
    },
    endpoints: {
      "/api/scrape": "Trigger scraping (POST)",
      "/api/scrape/status": "Get last scrape status (GET)",
    },
  });
}
