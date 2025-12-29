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

const SESSION_COOKIE_NAME = "admin_session";

// Check if user has valid admin session
function hasValidAdminSession(request: NextRequest): boolean {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  // In production, require password to be configured
  if (!passwordHash || passwordHash.trim() === "") {
    const host = request.headers.get("host") || "";
    // Only allow session-based auth in development
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      return false;
    }
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
  return !!sessionToken?.value;
}

// Authentication - API key OR valid admin session
function isAuthorized(request: NextRequest): boolean {
  // Check API key first
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.SCRAPER_API_KEY;

  if (expectedKey && expectedKey.trim() !== "" && apiKey === expectedKey) {
    return true;
  }

  // Check for valid admin session (from /admin dashboard)
  if (hasValidAdminSession(request)) {
    return true;
  }

  // In development without keys, allow localhost access
  const host = request.headers.get("host") || "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const hasApiKey = expectedKey && expectedKey.trim() !== "";
    const hasPasswordHash = process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.trim() !== "";

    // Only allow if no auth is configured at all (pure development)
    if (!hasApiKey && !hasPasswordHash) {
      console.warn("No auth configured - allowing localhost access");
      return true;
    }
  }

  return false;
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
  if (!isAuthorized(request)) {
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
