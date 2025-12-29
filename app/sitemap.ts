import { MetadataRoute } from "next";
import prisma from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aireshark.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages (always included)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/firms`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/brands`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    // Get all PE firms
    const firms = await prisma.privateEquityFirm.findMany({
      select: { slug: true, updatedAt: true },
    });

    // Get all brands
    const brands = await prisma.brand.findMany({
      select: { slug: true, updatedAt: true },
    });

    // PE firm pages
    const firmPages: MetadataRoute.Sitemap = firms.map((firm) => ({
      url: `${siteUrl}/firms/${firm.slug}`,
      lastModified: firm.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Brand pages
    const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
      url: `${siteUrl}/brands/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...firmPages, ...brandPages];
  } catch {
    // Database not available - return only static pages
    return staticPages;
  }
}
