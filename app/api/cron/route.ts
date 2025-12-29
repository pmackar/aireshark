import { NextRequest, NextResponse } from "next/server";
import {
  runAllScrapers,
  runNewsScrapeOnly,
  runPortfolioScrapeOnly,
} from "@/lib/scraper";

// Verify the request is from Vercel Cron
function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured, check for Vercel's cron header
  if (!cronSecret) {
    // Vercel sets this header for cron jobs
    return request.headers.get("x-vercel-cron") === "true";
  }

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
      case "daily":
        // Daily: Run news scrapers
        console.log("Running daily news scrape...");
        result = await runNewsScrapeOnly();
        break;

      case "weekly":
        // Weekly: Run portfolio scrapers
        console.log("Running weekly portfolio scrape...");
        result = await runPortfolioScrapeOnly();
        break;

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
