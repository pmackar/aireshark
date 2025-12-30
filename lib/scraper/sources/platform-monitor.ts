import * as cheerio from "cheerio";
import { scrapePageContent } from "../browser";
import { extractPEFirmInfo } from "../extractor";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

interface BrandInfo {
  name: string;
  website?: string;
  location?: string;
}

interface BrandSnapshot {
  brands: string[]; // Just brand names for comparison
  scrapedAt: string;
}

interface DiffResult {
  added: string[];
  removed: string[];
}

interface PlatformMonitorResult {
  platformName: string;
  brandsFound: number;
  brandsAdded: number;
  brandsRemoved: number;
  errors: string[];
}

interface PlatformConfig {
  slug: string;
  extractBrands?: (html: string) => BrandInfo[];
}

// Filter out invalid brand names (testimonials, etc.)
function isValidBrandName(name: string): boolean {
  const invalidPatterns = [
    /^from /i,
    /general manager/i,
    /customers$/i,
    /^testimonial/i,
    /^quote/i,
    /^gallery$/i,
    /^\d+$/,  // Just numbers
    /^[a-z]$/i,  // Single letter
    /commitment/i,
    /priceless/i,
    /integrity/i,
    /unwavering/i,
  ];

  return (
    name.length > 3 &&
    name.length < 60 &&
    !invalidPatterns.some(pattern => pattern.test(name))
  );
}

// Platform-specific brand extraction configs
const PLATFORM_EXTRACTORS: Record<string, (html: string) => BrandInfo[]> = {
  "sila-services": (html: string) => {
    const brands: BrandInfo[] = [];
    const seenBrands = new Set<string>();

    // Sila's page has "From [Brand Name] Customers" pattern in h2 tags
    const customerPattern = /From\s+(.+?)\s+Customers/gi;
    let match;

    while ((match = customerPattern.exec(html)) !== null) {
      let name = match[1]
        .replace(/&amp;/g, "&")
        .replace(/&#8217;/g, "'")
        .replace(/&#39;/g, "'")
        .trim();

      // Skip if it's Sila itself or already seen
      const lowerName = name.toLowerCase();
      if (lowerName.includes("sila") || seenBrands.has(lowerName)) {
        continue;
      }

      seenBrands.add(lowerName);

      if (isValidBrandName(name)) {
        brands.push({ name });
      }
    }

    return brands;
  },

  "apex-service-partners": (html: string) => {
    const $ = cheerio.load(html);
    const brands: BrandInfo[] = [];

    $(".partner-card, .partner, .brand-card, [class*='partner'], .grid-item").each(
      (_, el) => {
        const $el = $(el);
        const name =
          $el.find("h2, h3, h4, .name, .title").first().text().trim() ||
          $el.find("img").attr("alt")?.trim();
        const website = $el.find("a").attr("href");
        const location = $el.find(".location, .city").text().trim();

        if (name && isValidBrandName(name) && !name.toLowerCase().includes("apex")) {
          brands.push({
            name,
            website: website?.startsWith("http") ? website : undefined,
            location: location || undefined,
          });
        }
      }
    );

    return brands;
  },

  "wrench-group": (html: string) => {
    const $ = cheerio.load(html);
    const brands: BrandInfo[] = [];

    $(".brand, .brand-card, .company, article, .brand-item").each((_, el) => {
      const $el = $(el);
      const name = $el.find("h2, h3, .brand-name, .title").first().text().trim();
      const website = $el.find("a[href*='http']").first().attr("href");
      const location = $el.find(".location, .market").text().trim();

      if (name && isValidBrandName(name) && !name.toLowerCase().includes("wrench")) {
        brands.push({
          name,
          website,
          location: location || undefined,
        });
      }
    });

    return brands;
  },
};

function diffBrandLists(
  oldBrands: string[],
  newBrands: string[]
): DiffResult {
  const oldSet = new Set(oldBrands.map((b) => b.toLowerCase()));
  const newSet = new Set(newBrands.map((b) => b.toLowerCase()));

  const added = newBrands.filter((b) => !oldSet.has(b.toLowerCase()));
  const removed = oldBrands.filter((b) => !newSet.has(b.toLowerCase()));

  return { added, removed };
}

async function scrapePlatformBrands(
  platformSlug: string,
  brandsPageUrl: string
): Promise<BrandInfo[]> {
  console.log(`[Monitor] Scraping brands for ${platformSlug}...`);

  try {
    const pageContent = await scrapePageContent(brandsPageUrl);
    if (!pageContent) {
      console.log(`[Monitor] Failed to scrape ${brandsPageUrl}`);
      return [];
    }

    // Try platform-specific extractor first
    const extractor = PLATFORM_EXTRACTORS[platformSlug];
    if (extractor) {
      const brands = extractor(pageContent.html);
      if (brands.length > 0) {
        console.log(
          `[Monitor] Extracted ${brands.length} brands using custom extractor for ${platformSlug}`
        );
        return brands;
      }
    }

    // Fall back to AI extraction
    const extracted = await extractPEFirmInfo(pageContent.content, platformSlug);
    console.log(
      `[Monitor] Extracted ${extracted.brands.length} brands using AI for ${platformSlug}`
    );
    return extracted.brands;
  } catch (error) {
    console.error(`[Monitor] Error scraping ${platformSlug}:`, error);
    return [];
  }
}

async function processBrandDiff(
  platform: {
    id: string;
    name: string;
    slug: string;
    privateEquityFirmId: string | null;
  },
  diff: DiffResult,
  brandsPageUrl: string
): Promise<{ added: number }> {
  let addedCount = 0;

  for (const brandName of diff.added) {
    const slug = brandName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      // Check if brand already exists
      const existing = await prisma.brand.findUnique({ where: { slug } });

      if (!existing) {
        // Create new brand
        const brand = await prisma.brand.create({
          data: {
            name: brandName,
            slug,
            platformId: platform.id,
            privateEquityFirmId: platform.privateEquityFirmId,
            acquisitionDate: new Date(),
            verificationSource: `Platform website: ${brandsPageUrl}`,
          },
        });

        console.log(`[Monitor] Created new brand: ${brandName}`);

        // Create acquisition record if we have a PE firm
        if (platform.privateEquityFirmId) {
          await prisma.acquisition.create({
            data: {
              date: new Date(),
              dealType: "acquisition",
              sourceUrl: brandsPageUrl,
              sourceTitle: `Discovered on ${platform.name} website`,
              notes: `Automatically detected via platform monitoring`,
              privateEquityFirmId: platform.privateEquityFirmId,
              platformId: platform.id,
              brandId: brand.id,
            },
          });
          console.log(`[Monitor] Created acquisition record for ${brandName}`);
        }

        addedCount++;
      } else if (!existing.platformId) {
        // Update existing brand to link to platform
        await prisma.brand.update({
          where: { slug },
          data: {
            platformId: platform.id,
            privateEquityFirmId:
              existing.privateEquityFirmId || platform.privateEquityFirmId,
          },
        });
        console.log(`[Monitor] Updated brand linkage: ${brandName}`);
      }
    } catch (error) {
      console.error(`[Monitor] Error processing brand ${brandName}:`, error);
    }
  }

  // Log removed brands (don't delete, just note)
  for (const brandName of diff.removed) {
    console.log(
      `[Monitor] Brand no longer on ${platform.name} website: ${brandName}`
    );
  }

  return { added: addedCount };
}

async function storeBrandSnapshot(
  platformId: string,
  brands: string[]
): Promise<void> {
  const snapshot: BrandSnapshot = {
    brands,
    scrapedAt: new Date().toISOString(),
  };

  await prisma.platform.update({
    where: { id: platformId },
    data: {
      lastBrandSnapshot: snapshot as unknown as Prisma.InputJsonValue,
      lastScrapedAt: new Date(),
    },
  });
}

async function logMonitorResult(
  platformId: string,
  result: PlatformMonitorResult
): Promise<void> {
  // Find or create a ScrapeSource for this platform
  const platform = await prisma.platform.findUnique({
    where: { id: platformId },
    select: { brandsPageUrl: true, name: true },
  });

  if (!platform?.brandsPageUrl) return;

  let source = await prisma.scrapeSource.findFirst({
    where: {
      platformId,
      sourceType: "platform_brands_page",
    },
  });

  if (!source) {
    source = await prisma.scrapeSource.create({
      data: {
        name: `${platform.name} - Brands Page`,
        url: platform.brandsPageUrl,
        sourceType: "platform_brands_page",
        scrapeFrequencyHours: 168, // Weekly
        platformId,
        isActive: true,
      },
    });
  }

  await prisma.scrapeLog.create({
    data: {
      sourceId: source.id,
      startedAt: new Date(),
      completedAt: new Date(),
      status: result.errors.length > 0 ? "partial" : "success",
      recordsFound: result.brandsFound,
      recordsNew: result.brandsAdded,
      errorMessage: result.errors.length > 0 ? result.errors.join("; ") : null,
    },
  });
}

export async function monitorPlatform(
  platformSlug: string
): Promise<PlatformMonitorResult> {
  const platform = await prisma.platform.findUnique({
    where: { slug: platformSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      brandsPageUrl: true,
      lastBrandSnapshot: true,
      privateEquityFirmId: true,
    },
  });

  if (!platform) {
    return {
      platformName: platformSlug,
      brandsFound: 0,
      brandsAdded: 0,
      brandsRemoved: 0,
      errors: [`Platform not found: ${platformSlug}`],
    };
  }

  if (!platform.brandsPageUrl) {
    return {
      platformName: platform.name,
      brandsFound: 0,
      brandsAdded: 0,
      brandsRemoved: 0,
      errors: [`No brands page URL configured for ${platform.name}`],
    };
  }

  const result: PlatformMonitorResult = {
    platformName: platform.name,
    brandsFound: 0,
    brandsAdded: 0,
    brandsRemoved: 0,
    errors: [],
  };

  try {
    // Scrape current brands
    const currentBrands = await scrapePlatformBrands(
      platform.slug,
      platform.brandsPageUrl
    );
    result.brandsFound = currentBrands.length;

    const currentBrandNames = currentBrands.map((b) => b.name);

    // Get previous snapshot
    const previousSnapshot = platform.lastBrandSnapshot as BrandSnapshot | null;
    const previousBrandNames = previousSnapshot?.brands || [];

    // Compare
    const diff = diffBrandLists(previousBrandNames, currentBrandNames);

    if (diff.added.length > 0) {
      console.log(
        `[Monitor] ${platform.name}: ${diff.added.length} new brands detected`
      );
      const processResult = await processBrandDiff(
        {
          id: platform.id,
          name: platform.name,
          slug: platform.slug,
          privateEquityFirmId: platform.privateEquityFirmId,
        },
        diff,
        platform.brandsPageUrl
      );
      result.brandsAdded = processResult.added;
    }

    result.brandsRemoved = diff.removed.length;

    // Store new snapshot
    await storeBrandSnapshot(platform.id, currentBrandNames);

    // Log result
    await logMonitorResult(platform.id, result);
  } catch (error) {
    const errorMsg = `Error monitoring ${platform.name}: ${error}`;
    console.error(`[Monitor] ${errorMsg}`);
    result.errors.push(errorMsg);
  }

  return result;
}

export async function runPlatformMonitor(): Promise<{
  platformsMonitored: number;
  totalBrandsFound: number;
  totalBrandsAdded: number;
  totalBrandsRemoved: number;
  results: PlatformMonitorResult[];
  errors: string[];
}> {
  console.log("[Monitor] Starting platform monitoring...");

  // Get all platforms with brands page URLs
  const platforms = await prisma.platform.findMany({
    where: {
      isActive: true,
      brandsPageUrl: { not: null },
    },
    select: {
      slug: true,
    },
  });

  console.log(`[Monitor] Found ${platforms.length} platforms to monitor`);

  const results: PlatformMonitorResult[] = [];
  const errors: string[] = [];
  let totalFound = 0;
  let totalAdded = 0;
  let totalRemoved = 0;

  for (const platform of platforms) {
    const result = await monitorPlatform(platform.slug);
    results.push(result);

    totalFound += result.brandsFound;
    totalAdded += result.brandsAdded;
    totalRemoved += result.brandsRemoved;
    errors.push(...result.errors);

    // Rate limiting between platforms
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  console.log(
    `[Monitor] Complete: ${platforms.length} platforms, ${totalFound} brands found, ${totalAdded} new`
  );

  return {
    platformsMonitored: platforms.length,
    totalBrandsFound: totalFound,
    totalBrandsAdded: totalAdded,
    totalBrandsRemoved: totalRemoved,
    results,
    errors,
  };
}
