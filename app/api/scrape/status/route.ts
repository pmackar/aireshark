import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
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
