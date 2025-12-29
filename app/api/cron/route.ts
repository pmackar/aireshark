import { NextRequest, NextResponse } from "next/server";
import {
  runAllScrapers,
  runNewsScrapeOnly,
  runPortfolioScrapeOnly,
  runRssScrapeOnly,
  runGmailScrapeOnly,
  runPlatformMonitorOnly,
  isGmailConfigured,
} from "@/lib/scraper";

// Verify the request is from Vercel Cron - REQUIRES secret in production
function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // CRON_SECRET is required in production
  if (!cronSecret || cronSecret.trim() === "") {
    // Only allow in development (localhost)
    const host = request.headers.get("host") || "";
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      console.warn("CRON_SECRET not set - allowing localhost access only");
      return true;
    }
    console.error("CRON_SECRET not configured - blocking request");
    return false;
  }

  // In production, require proper authorization header
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "daily";

  try {
    let result;

    switch (type) {
      case "daily": {
        // Daily: Run RSS feeds, Gmail alerts, news scrapers
        console.log("Running daily scrape (RSS, Gmail, News)...");
        const dailyResults: Record<string, unknown> = {};

        // RSS feeds
        try {
          dailyResults.rss = await runRssScrapeOnly();
        } catch (e) {
          console.error("RSS scrape failed:", e);
          dailyResults.rss = { error: String(e) };
        }

        // Gmail alerts (if configured)
        if (isGmailConfigured()) {
          try {
            dailyResults.gmail = await runGmailScrapeOnly();
          } catch (e) {
            console.error("Gmail scrape failed:", e);
            dailyResults.gmail = { error: String(e) };
          }
        } else {
          dailyResults.gmail = { skipped: "Gmail not configured" };
        }

        // News scraper
        try {
          dailyResults.news = await runNewsScrapeOnly();
        } catch (e) {
          console.error("News scrape failed:", e);
          dailyResults.news = { error: String(e) };
        }

        result = dailyResults;
        break;
      }

      case "weekly": {
        // Weekly: Run platform monitoring and portfolio scrapers
        console.log("Running weekly scrape (platforms, portfolio)...");
        const weeklyResults: Record<string, unknown> = {};

        // Platform monitoring with diff detection
        try {
          weeklyResults.platforms = await runPlatformMonitorOnly();
        } catch (e) {
          console.error("Platform monitor failed:", e);
          weeklyResults.platforms = { error: String(e) };
        }

        // Legacy portfolio scraper
        try {
          weeklyResults.portfolio = await runPortfolioScrapeOnly();
        } catch (e) {
          console.error("Portfolio scrape failed:", e);
          weeklyResults.portfolio = { error: String(e) };
        }

        result = weeklyResults;
        break;
      }

      case "full":
        // Full scrape (manual trigger or monthly)
        console.log("Running full scrape...");
        result = await runAllScrapers();
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type. Use: daily, weekly, or full" },
          { status: 400 }
        );
    }

    console.log(`Cron job (${type}) completed:`, result);

    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Cron job (${type}) failed:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
