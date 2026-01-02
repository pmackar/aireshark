import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isUserAdmin } from "@/lib/auth";

// Authentication - API key OR admin user session
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.AIRESHARK_API_KEY || process.env.SCRAPER_API_KEY;

  if (expectedKey && expectedKey.trim() !== "" && apiKey === expectedKey) {
    return true;
  }

  if (await isUserAdmin()) {
    return true;
  }

  // Only allow localhost if no API key configured
  const host = request.headers.get("host") || "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const hasApiKey = expectedKey && expectedKey.trim() !== "";
    if (!hasApiKey) {
      return true;
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!(await isAuthorized(request))) {
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
