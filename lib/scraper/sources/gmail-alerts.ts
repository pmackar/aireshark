import { google, gmail_v1 } from "googleapis";
import { scrapePageContent } from "../browser";
import { extractFromArticle, classifyArticleRelevance } from "../extractor";
import prisma from "@/lib/db";

// Gmail API client setup
function getGmailClient(): gmail_v1.Gmail | null {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.log("[Gmail] Gmail API credentials not configured");
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

interface AlertEmail {
  id: string;
  threadId: string;
  subject: string;
  date: Date;
  urls: string[];
  snippet: string;
}

interface GmailAlertResult {
  emailsProcessed: number;
  articlesFound: number;
  articlesStored: number;
  errors: string[];
}

// Extract URLs from Google Alerts email HTML body
function extractUrlsFromAlertEmail(htmlBody: string): string[] {
  const urls: string[] = [];

  // Google Alerts emails contain links in specific patterns
  const urlPatterns = [
    // Standard link pattern
    /href="(https?:\/\/[^"]+)"/g,
    // Google redirect URL pattern
    /url=(https?:\/\/[^&"]+)/g,
  ];

  for (const pattern of urlPatterns) {
    const matches = htmlBody.matchAll(pattern);
    for (const match of matches) {
      let url = match[1];

      // Decode URL if needed
      try {
        url = decodeURIComponent(url);
      } catch {
        // Keep original if decode fails
      }

      // Filter out Google tracking URLs and non-article links
      if (
        url &&
        !url.includes("google.com/alerts") &&
        !url.includes("google.com/url") &&
        !url.includes("support.google.com") &&
        !url.includes("accounts.google.com") &&
        !url.includes("unsubscribe") &&
        !url.includes("preferences") &&
        (url.includes("http://") || url.includes("https://"))
      ) {
        // Extract actual URL from Google redirect if present
        const googleUrlMatch = url.match(/url=(https?:\/\/[^&]+)/);
        if (googleUrlMatch) {
          urls.push(decodeURIComponent(googleUrlMatch[1]));
        } else if (!urls.includes(url)) {
          urls.push(url);
        }
      }
    }
  }

  // Deduplicate
  return [...new Set(urls)];
}

// Decode base64url encoded email body
function decodeEmailBody(data: string): string {
  try {
    // Gmail uses base64url encoding
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

// Get the HTML body from email parts
function getHtmlBody(payload: gmail_v1.Schema$MessagePart): string {
  if (payload.body?.data && payload.mimeType === "text/html") {
    return decodeEmailBody(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const html = getHtmlBody(part);
      if (html) return html;
    }
  }

  return "";
}

// Get header value from email
function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

async function fetchAlertEmails(
  gmail: gmail_v1.Gmail,
  sinceDate: Date
): Promise<AlertEmail[]> {
  const alerts: AlertEmail[] = [];

  try {
    // Search for Google Alerts emails
    const afterDate = Math.floor(sinceDate.getTime() / 1000);
    const query = `from:googlealerts-noreply@google.com after:${afterDate}`;

    console.log(`[Gmail] Searching with query: ${query}`);

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 50,
    });

    if (!response.data.messages) {
      console.log("[Gmail] No alert emails found");
      return [];
    }

    console.log(`[Gmail] Found ${response.data.messages.length} alert emails`);

    for (const message of response.data.messages) {
      if (!message.id) continue;

      try {
        const fullMessage = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        const headers = fullMessage.data.payload?.headers;
        const subject = getHeader(headers, "Subject");
        const dateStr = getHeader(headers, "Date");
        const htmlBody = getHtmlBody(fullMessage.data.payload || {});

        if (!htmlBody) {
          console.log(`[Gmail] No HTML body for message ${message.id}`);
          continue;
        }

        const urls = extractUrlsFromAlertEmail(htmlBody);

        if (urls.length > 0) {
          alerts.push({
            id: message.id,
            threadId: message.threadId || message.id,
            subject,
            date: dateStr ? new Date(dateStr) : new Date(),
            urls,
            snippet: fullMessage.data.snippet || "",
          });
        }
      } catch (error) {
        console.error(`[Gmail] Error fetching message ${message.id}:`, error);
      }
    }
  } catch (error) {
    console.error("[Gmail] Error searching emails:", error);
  }

  return alerts;
}

async function processAlertUrl(
  url: string,
  alertSubject: string
): Promise<boolean> {
  try {
    // Check if already processed
    const existing = await prisma.article.findUnique({
      where: { url },
    });

    if (existing) {
      return false;
    }

    // Scrape the article
    const pageContent = await scrapePageContent(url);
    if (!pageContent) {
      console.log(`[Gmail] Failed to scrape: ${url}`);
      return false;
    }

    // Quick relevance check
    const title = pageContent.title || alertSubject;
    const snippet = pageContent.content.slice(0, 500);
    const relevance = await classifyArticleRelevance(title, snippet);

    if (!relevance.isRelevant || relevance.confidence < 40) {
      console.log(`[Gmail] Not relevant: ${title.slice(0, 50)}...`);
      return false;
    }

    // Extract structured data
    const extracted = await extractFromArticle(pageContent.content, url);
    if (!extracted || !extracted.isRelevant) {
      return false;
    }

    // Find matching platform or PE firm
    let platformId: string | null = null;
    let peFirmId: string | null = null;

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
        title: extracted.title || title,
        url,
        source: "Google Alerts",
        summary: extracted.summary,
        publishedDate: new Date(),
        platformId,
        privateEquityFirmId: peFirmId,
      },
    });

    console.log(`[Gmail] Stored: ${(extracted.title || title).slice(0, 50)}...`);

    // Process acquisitions
    for (const acq of extracted.acquisitions) {
      if (acq.relevanceScore >= 70 && acq.peFirmName && acq.acquiredCompanyName) {
        await processAcquisitionFromGmail(acq, url, platformId);
      }
    }

    return true;
  } catch (error) {
    console.error(`[Gmail] Error processing ${url}:`, error);
    return false;
  }
}

async function processAcquisitionFromGmail(
  acq: {
    peFirmName: string | null;
    acquiredCompanyName: string | null;
    acquisitionDate: string | null;
    dealAmount: string | null;
    location: string | null;
    summary: string;
  },
  sourceUrl: string,
  platformId: string | null
): Promise<void> {
  if (!acq.peFirmName || !acq.acquiredCompanyName) return;

  try {
    let peFirm = await prisma.privateEquityFirm.findFirst({
      where: {
        name: { contains: acq.peFirmName, mode: "insensitive" },
      },
    });

    let platform = platformId
      ? await prisma.platform.findUnique({ where: { id: platformId } })
      : await prisma.platform.findFirst({
          where: {
            name: { contains: acq.peFirmName, mode: "insensitive" },
          },
        });

    if (!peFirm && !platform) {
      console.log(`[Gmail] No matching PE firm or platform for: ${acq.peFirmName}`);
      return;
    }

    if (platform && !peFirm && platform.privateEquityFirmId) {
      peFirm = await prisma.privateEquityFirm.findUnique({
        where: { id: platform.privateEquityFirmId },
      });
    }

    if (!peFirm) {
      console.log(`[Gmail] No PE firm found for acquisition: ${acq.acquiredCompanyName}`);
      return;
    }

    const slug = acq.acquiredCompanyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let brand = await prisma.brand.findUnique({ where: { slug } });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: acq.acquiredCompanyName,
          slug,
          location: acq.location,
          acquisitionDate: acq.acquisitionDate
            ? new Date(acq.acquisitionDate)
            : new Date(),
          acquisitionPrice: acq.dealAmount,
          privateEquityFirmId: peFirm.id,
          platformId: platform?.id,
        },
      });
      console.log(`[Gmail] Created brand: ${brand.name}`);
    }

    const existingAcq = await prisma.acquisition.findFirst({
      where: {
        privateEquityFirmId: peFirm.id,
        brandId: brand.id,
      },
    });

    if (!existingAcq) {
      await prisma.acquisition.create({
        data: {
          date: acq.acquisitionDate ? new Date(acq.acquisitionDate) : new Date(),
          amount: acq.dealAmount,
          dealType: "acquisition",
          sourceUrl,
          privateEquityFirmId: peFirm.id,
          platformId: platform?.id,
          brandId: brand.id,
          notes: acq.summary,
        },
      });
      console.log(`[Gmail] Created acquisition: ${peFirm.name} → ${brand.name}`);
    }
  } catch (error) {
    console.error("[Gmail] Error processing acquisition:", error);
  }
}

async function logGmailScrapeResult(
  result: GmailAlertResult,
  startedAt: Date
): Promise<void> {
  try {
    // Find or create Gmail alerts source
    let source = await prisma.scrapeSource.findFirst({
      where: {
        sourceType: "gmail_alerts",
      },
    });

    if (!source) {
      source = await prisma.scrapeSource.create({
        data: {
          name: "Google Alerts (Gmail)",
          url: "gmail://alerts",
          sourceType: "gmail_alerts",
          scrapeFrequencyHours: 6,
          isActive: true,
        },
      });
    }

    await prisma.scrapeLog.create({
      data: {
        sourceId: source.id,
        startedAt,
        completedAt: new Date(),
        status: result.errors.length > 0 ? "partial" : "success",
        recordsFound: result.articlesFound,
        recordsNew: result.articlesStored,
        errorMessage: result.errors.length > 0 ? result.errors.join("; ") : null,
      },
    });

    await prisma.scrapeSource.update({
      where: { id: source.id },
      data: {
        lastScrapedAt: new Date(),
        lastSuccessAt: result.errors.length === 0 ? new Date() : undefined,
        consecutiveFailures: result.errors.length > 0 ? { increment: 1 } : 0,
      },
    });
  } catch (error) {
    console.error("[Gmail] Error logging scrape result:", error);
  }
}

export async function runGmailAlertsScraper(): Promise<GmailAlertResult> {
  console.log("[Gmail] Starting Gmail alerts scraper...");
  const startedAt = new Date();

  const result: GmailAlertResult = {
    emailsProcessed: 0,
    articlesFound: 0,
    articlesStored: 0,
    errors: [],
  };

  const gmail = getGmailClient();
  if (!gmail) {
    result.errors.push("Gmail API not configured");
    await logGmailScrapeResult(result, startedAt);
    return result;
  }

  try {
    // Look back 7 days for alerts
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 7);

    const alerts = await fetchAlertEmails(gmail, sinceDate);
    result.emailsProcessed = alerts.length;

    console.log(`[Gmail] Processing ${alerts.length} alert emails`);

    for (const alert of alerts) {
      result.articlesFound += alert.urls.length;

      for (const url of alert.urls) {
        const stored = await processAlertUrl(url, alert.subject);
        if (stored) {
          result.articlesStored++;
        }

        // Rate limiting between URLs
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Rate limiting between emails
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    const errorMsg = `Gmail scraper error: ${error}`;
    console.error(`[Gmail] ${errorMsg}`);
    result.errors.push(errorMsg);
  }

  await logGmailScrapeResult(result, startedAt);

  console.log(
    `[Gmail] Complete: ${result.emailsProcessed} emails, ${result.articlesFound} URLs, ${result.articlesStored} stored`
  );

  return result;
}

// Helper to check if Gmail is configured
export function isGmailConfigured(): boolean {
  return !!(
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  );
}
