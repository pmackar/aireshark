import * as cheerio from "cheerio";
import { scrapePageContent } from "../browser";
import { extractPEFirmInfo } from "../extractor";
import prisma from "@/lib/db";

interface PortfolioSource {
  firmSlug: string;
  firmName: string;
  portfolioUrl: string;
  // Custom extraction logic for each site
  extractBrands?: (html: string) => Array<{
    name: string;
    website?: string;
    location?: string;
  }>;
}

const PORTFOLIO_SOURCES: PortfolioSource[] = [
  {
    firmSlug: "apex-service-partners",
    firmName: "Apex Service Partners",
    portfolioUrl: "https://apexservicepartners.com/our-partners/",
    extractBrands: (html: string) => {
      const $ = cheerio.load(html);
      const brands: Array<{ name: string; website?: string; location?: string }> = [];

      // Apex lists partners as cards/tiles
      $(".partner-card, .partner, .brand-card, [class*='partner']").each(
        (_, el) => {
          const $el = $(el);
          const name =
            $el.find("h2, h3, h4, .name, .title").first().text().trim() ||
            $el.find("img").attr("alt")?.trim();
          const website = $el.find("a").attr("href");
          const location = $el.find(".location, .city").text().trim();

          if (name && name.length > 2) {
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
  },
  {
    firmSlug: "wrench-group",
    firmName: "Wrench Group",
    portfolioUrl: "https://wrenchgroup.com/our-brands/",
    extractBrands: (html: string) => {
      const $ = cheerio.load(html);
      const brands: Array<{ name: string; website?: string; location?: string }> = [];

      $(".brand, .brand-card, .company, article").each((_, el) => {
        const $el = $(el);
        const name = $el.find("h2, h3, .brand-name").first().text().trim();
        const website = $el.find("a[href*='http']").first().attr("href");
        const location = $el.find(".location, .market").text().trim();

        if (name && name.length > 2) {
          brands.push({
            name,
            website,
            location: location || undefined,
          });
        }
      });

      return brands;
    },
  },
  {
    firmSlug: "redwood-services",
    firmName: "Redwood Services",
    portfolioUrl: "https://redwood-services.com/our-companies/",
  },
  {
    firmSlug: "alpine-investors",
    firmName: "Alpine Investors",
    portfolioUrl: "https://alpineinvestors.com/our-companies/",
  },
];

export async function scrapePortfolioPage(
  source: PortfolioSource
): Promise<Array<{ name: string; website?: string; location?: string }>> {
  console.log(`Scraping portfolio for ${source.firmName}...`);

  try {
    const pageContent = await scrapePageContent(source.portfolioUrl);
    if (!pageContent) {
      console.log(`Failed to scrape ${source.portfolioUrl}`);
      return [];
    }

    // Try custom extractor first
    if (source.extractBrands) {
      const brands = source.extractBrands(pageContent.html);
      if (brands.length > 0) {
        console.log(
          `Extracted ${brands.length} brands using custom extractor for ${source.firmName}`
        );
        return brands;
      }
    }

    // Fall back to AI extraction
    const extracted = await extractPEFirmInfo(pageContent.content, source.firmName);
    console.log(
      `Extracted ${extracted.brands.length} brands using AI for ${source.firmName}`
    );
    return extracted.brands;
  } catch (error) {
    console.error(`Error scraping ${source.firmName} portfolio:`, error);
    return [];
  }
}

export async function updateFirmPortfolio(firmSlug: string): Promise<{
  brandsFound: number;
  brandsAdded: number;
}> {
  const source = PORTFOLIO_SOURCES.find((s) => s.firmSlug === firmSlug);
  if (!source) {
    console.log(`No portfolio source configured for ${firmSlug}`);
    return { brandsFound: 0, brandsAdded: 0 };
  }

  const firm = await prisma.privateEquityFirm.findUnique({
    where: { slug: firmSlug },
  });

  if (!firm) {
    console.log(`PE firm not found: ${firmSlug}`);
    return { brandsFound: 0, brandsAdded: 0 };
  }

  const brands = await scrapePortfolioPage(source);
  let added = 0;

  for (const brand of brands) {
    const slug = brand.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      // Check if brand exists
      const existing = await prisma.brand.findUnique({ where: { slug } });

      if (!existing) {
        await prisma.brand.create({
          data: {
            name: brand.name,
            slug,
            website: brand.website,
            location: brand.location,
            privateEquityFirmId: firm.id,
          },
        });
        added++;
        console.log(`Added new brand: ${brand.name}`);
      } else if (!existing.privateEquityFirmId) {
        // Update if not already linked to a PE firm
        await prisma.brand.update({
          where: { slug },
          data: {
            privateEquityFirmId: firm.id,
            website: brand.website || existing.website,
            location: brand.location || existing.location,
          },
        });
        console.log(`Updated brand ownership: ${brand.name}`);
      }
    } catch (error) {
      console.error(`Error processing brand ${brand.name}:`, error);
    }
  }

  return { brandsFound: brands.length, brandsAdded: added };
}

export async function runPortfolioScraper(): Promise<{
  firmsScraped: number;
  totalBrandsFound: number;
  totalBrandsAdded: number;
}> {
  console.log("Starting portfolio scraper...");

  let totalFound = 0;
  let totalAdded = 0;

  for (const source of PORTFOLIO_SOURCES) {
    const result = await updateFirmPortfolio(source.firmSlug);
    totalFound += result.brandsFound;
    totalAdded += result.brandsAdded;

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  console.log(
    `Portfolio scraping complete: ${totalFound} brands found, ${totalAdded} added`
  );
  return {
    firmsScraped: PORTFOLIO_SOURCES.length,
    totalBrandsFound: totalFound,
    totalBrandsAdded: totalAdded,
  };
}

// Function to add a new portfolio source dynamically
export async function addPortfolioSource(
  firmSlug: string,
  portfolioUrl: string
): Promise<void> {
  const firm = await prisma.privateEquityFirm.findUnique({
    where: { slug: firmSlug },
  });

  if (!firm) {
    throw new Error(`PE firm not found: ${firmSlug}`);
  }

  // Check if we can scrape the URL
  const pageContent = await scrapePageContent(portfolioUrl);
  if (!pageContent) {
    throw new Error(`Could not access portfolio URL: ${portfolioUrl}`);
  }

  // For now, we rely on AI extraction for new sources
  const extracted = await extractPEFirmInfo(pageContent.content, firm.name);

  console.log(
    `Found ${extracted.brands.length} brands at ${portfolioUrl} for ${firm.name}`
  );

  // Update the firm's description if we got a better one
  if (extracted.description && !firm.description) {
    await prisma.privateEquityFirm.update({
      where: { slug: firmSlug },
      data: { description: extracted.description },
    });
  }
}
