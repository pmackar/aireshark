import * as dotenv from "dotenv";
dotenv.config();

import { scrapePageContentLite } from "../lib/scraper/browser";
import { extractFromArticle, classifyArticleRelevance } from "../lib/scraper/extractor";
import prisma from "../lib/db";

const HOMEPROS_URLS = [
  "https://homepros.news/bain-capital-rounds-up-3-1-billion-to-buy-service-logic/",
  "https://homepros.news/jpmorgan-accelerates-push-into-commercial-hvac-related-services/",
  "https://homepros.news/contractor-owned-platform-preps-for-potential-sale/",
  "https://homepros.news/rheem-parent-finalizes-acquisition-of-fujitsu-general/",
  "https://homepros.news/sfp-advisors-ceo-on-the-hvac-ma-market/",
  "https://homepros.news/lennox-to-acquire-hvac-parts-brands-for-550-million/",
  "https://homepros.news/supplyhouse-lands-private-equity-investment/",
  "https://homepros.news/rheem-parent-moves-forward-with-fujitsu-hvac-acquisition/",
  "https://homepros.news/columbia-home-services-p1-service-group-near-merger/",
  "https://homepros.news/air-pros-lines-up-buyers-in-bankruptcy-case-docs-show/",
  "https://homepros.news/redwood-services-to-land-majority-investment-in-1-1-billion-deal/",
  "https://homepros.news/merger-forms-major-midwest-hvac-distributor/",
  "https://homepros.news/hvac-distributor-acquires-coastal-supply-rj-murray/",
  "https://homepros.news/koch-air-acquires-standard-air-expands-into-northeast/",
  "https://homepros.news/hvac-investors-eye-ma-uptick-in-2025/",
  "https://homepros.news/apex-service-partners-acquires-technology-company/",
  "https://homepros.news/hvac-investments-flowing-to-the-south-analysis-shows/",
  "https://homepros.news/goldman-sachs-private-equity-arm-to-acquire-sila-services/",
  "https://homepros.news/zephyr-a-new-home-services-roll-up-raises-60-million/",
  "https://homepros.news/ars-flint-group-turnpoint-services-ceos-talk-operations-state-of-the-hvac-industry/",
  "https://homepros.news/hvac-deals-september-2024/",
  "https://homepros.news/inside-pantheon/",
];

async function processUrl(url: string): Promise<{ stored: boolean; reason: string }> {
  try {
    // Check if already exists
    const existing = await prisma.article.findUnique({ where: { url } });
    if (existing) {
      return { stored: false, reason: "duplicate" };
    }

    // Scrape content
    const content = await scrapePageContentLite(url);
    if (!content) {
      return { stored: false, reason: "scrape_failed" };
    }

    // Check relevance
    const relevance = await classifyArticleRelevance(content.title, content.content.slice(0, 500));
    if (!relevance.isRelevant || relevance.confidence < 40) {
      return { stored: false, reason: "not_relevant" };
    }

    // Extract data
    const extracted = await extractFromArticle(content.content, url);
    if (!extracted || !extracted.isRelevant) {
      return { stored: false, reason: "extraction_failed" };
    }

    // Find matching PE firm
    let peFirmId: string | null = null;
    let platformId: string | null = null;

    if (extracted.peFirmMentions.length > 0) {
      const platform = await prisma.platform.findFirst({
        where: {
          OR: extracted.peFirmMentions.map((name) => ({
            name: { contains: name, mode: "insensitive" as const },
          })),
        },
      });

      if (platform) {
        platformId = platform.id;
        peFirmId = platform.privateEquityFirmId;
      } else {
        const peFirm = await prisma.privateEquityFirm.findFirst({
          where: {
            OR: extracted.peFirmMentions.map((name) => ({
              name: { contains: name, mode: "insensitive" as const },
            })),
          },
        });
        peFirmId = peFirm?.id || null;
      }
    }

    // Store article
    await prisma.article.create({
      data: {
        title: extracted.title || content.title,
        url,
        source: "Homepros",
        summary: extracted.summary,
        publishedDate: new Date(),
        platformId,
        privateEquityFirmId: peFirmId,
      },
    });

    return { stored: true, reason: "success" };
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
    return { stored: false, reason: "error" };
  }
}

async function main() {
  console.log(`Processing ${HOMEPROS_URLS.length} Homepros articles...`);

  const results = {
    stored: 0,
    duplicate: 0,
    scrape_failed: 0,
    not_relevant: 0,
    extraction_failed: 0,
    error: 0,
  };

  for (const url of HOMEPROS_URLS) {
    const title = url.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || url;
    process.stdout.write(`Processing: ${title.slice(0, 50)}... `);

    const { stored, reason } = await processUrl(url);

    if (stored) {
      results.stored++;
      console.log("✓ STORED");
    } else {
      results[reason as keyof typeof results]++;
      console.log(`✗ ${reason}`);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n=== Results ===");
  console.log(`Stored: ${results.stored}`);
  console.log(`Duplicates: ${results.duplicate}`);
  console.log(`Scrape failed: ${results.scrape_failed}`);
  console.log(`Not relevant: ${results.not_relevant}`);
  console.log(`Extraction failed: ${results.extraction_failed}`);
  console.log(`Errors: ${results.error}`);

  await prisma.$disconnect();
}

main().catch(console.error);
