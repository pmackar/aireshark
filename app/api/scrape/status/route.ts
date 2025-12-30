import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const SESSION_COOKIE_NAME = "admin_session";

// Check if user has valid admin session
function hasValidAdminSession(request: NextRequest): boolean {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  // In production, require password to be configured
  if (!passwordHash || passwordHash.trim() === "") {
    const host = request.headers.get("host") || "";
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      return false;
    }
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
  return !!sessionToken?.value;
}

// Authentication - API key OR valid admin session
function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.AIRESHARK_API_KEY || process.env.SCRAPER_API_KEY;

  if (expectedKey && expectedKey.trim() !== "" && apiKey === expectedKey) {
    return true;
  }

  if (hasValidAdminSession(request)) {
    return true;
  }

  // Only allow localhost if no auth configured
  const host = request.headers.get("host") || "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const hasApiKey = expectedKey && expectedKey.trim() !== "";
    const hasPasswordHash = process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.trim() !== "";
    if (!hasApiKey && !hasPasswordHash) {
      return true;
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Get counts from database
    const [firmCount, brandCount, articleCount, acquisitionCount] =
      await Promise.all([
        prisma.privateEquityFirm.count(),
        prisma.brand.count(),
        prisma.article.count(),
        prisma.acquisition.count(),
      ]);

    // Get recent articles
    const recentArticles = await prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        source: true,
        url: true,
        createdAt: true,
      },
    });

    // Get recent acquisitions
    const recentAcquisitions = await prisma.acquisition.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        privateEquityFirm: { select: { name: true } },
        brand: { select: { name: true } },
      },
    });

    return NextResponse.json({
      status: "ok",
      counts: {
        peFirms: firmCount,
        brands: brandCount,
        articles: articleCount,
        acquisitions: acquisitionCount,
      },
      recentArticles,
      recentAcquisitions: recentAcquisitions.map((a) => ({
        peFirm: a.privateEquityFirm.name,
        brand: a.brand?.name || "Unknown",
        date: a.date,
        amount: a.amount,
        addedAt: a.createdAt,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
