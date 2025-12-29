# Data Ingestion System

This document describes the automated data pipeline for discovering HVAC acquisitions from multiple sources.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  RSS Feeds (rss-parser)                             │
│  - ACHR News M&A, Contracting Business, etc.        │
│  - Polls every 6 hours                              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  Platform Website Monitoring (Puppeteer)            │
│  - Sila, Apex, Wrench Group brand pages             │
│  - Weekly scrape with diff detection                │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  Gmail Alerts (googleapis)                          │
│  - Parses Google Alerts emails                      │
│  - Polls every 6 hours                              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  Processing Pipeline                                │
│  - OpenAI classification & extraction               │
│  - Prisma database storage                          │
│  - ScrapeSource/ScrapeLog tracking                  │
└─────────────────────────────────────────────────────┘
```

---

## Phase 1: RSS Feed Polling

### Overview
Polls industry RSS feeds for acquisition news and processes articles through the existing OpenAI pipeline.

### File Location
`lib/scraper/sources/rss-feeds.ts`

### Configured Feeds

| Source | Feed URL | Type |
|--------|----------|------|
| ACHR News M&A | `https://www.achrnews.com/rss/topics/2669-mergers-acquisitions` | News |
| Contracting Business | `https://www.contractingbusiness.com/rss` | News |
| PHCP Pros | `https://www.phcppros.com/rss` | News |
| PR Newswire HVAC | `https://www.prnewswire.com/rss/consumer-products-services-news.rss` | Press |

### How It Works

1. **Fetch RSS Feed**: Uses `rss-parser` to parse each feed URL
2. **Quick Relevance Check**: Uses OpenAI to determine if article title/snippet is relevant to PE/HVAC
3. **Full Article Scrape**: If relevant, scrapes the full article with Puppeteer
4. **Data Extraction**: Uses OpenAI to extract structured data (PE firm, brand, deal amount, etc.)
5. **Database Storage**: Creates Article records, and optionally Brand/Acquisition records
6. **Logging**: Records results to ScrapeSource and ScrapeLog tables

### API Usage

```bash
# Trigger RSS scraper manually
curl -X POST https://your-domain.vercel.app/api/scrape \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_SCRAPER_API_KEY" \
  -d '{"type": "rss"}'
```

### Response Example

```json
{
  "success": true,
  "type": "rss",
  "result": {
    "totalArticlesFound": 45,
    "totalArticlesStored": 3,
    "feedResults": [
      {
        "feedName": "ACHR News - M&A",
        "articlesFound": 15,
        "articlesStored": 2,
        "errors": []
      }
    ],
    "duration": 45000
  }
}
```

### Adding New RSS Feeds

Edit `lib/scraper/sources/rss-feeds.ts` and add to the `RSS_FEEDS` array:

```typescript
const RSS_FEEDS: RssFeedConfig[] = [
  // ... existing feeds
  {
    name: "Your New Feed",
    url: "https://example.com/rss",
    sourceType: "rss_news", // or "rss_press"
  },
];
```

---

## Phase 2: Platform Website Monitoring

### Overview
Monitors platform brand pages (e.g., silaservices.com/brands/) for changes, detecting when new brands are added.

### File Location
`lib/scraper/sources/platform-monitor.ts`

### Database Schema Addition

The Platform model includes a `lastBrandSnapshot` field (Json) that stores the previous list of brands for comparison:

```prisma
model Platform {
  // ... other fields
  lastBrandSnapshot Json?  // Stores brand list for diff detection
}
```

### How It Works

1. **Fetch Platforms**: Queries all active platforms with `brandsPageUrl` configured
2. **Scrape Brand Page**: Uses Puppeteer to render the page and extract brand names
3. **Compare with Snapshot**: Diffs current brands against `lastBrandSnapshot`
4. **Process New Brands**: For each new brand detected:
   - Creates a Brand record
   - Creates an Acquisition record (date = today)
   - Links to the Platform and PE Firm
5. **Store New Snapshot**: Updates `lastBrandSnapshot` with current brand list
6. **Logging**: Records results to ScrapeSource and ScrapeLog

### Platform-Specific Extractors

The system includes custom CSS selector configurations for known platforms:

```typescript
const PLATFORM_EXTRACTORS = {
  "sila-services": (html) => { /* custom extraction */ },
  "apex-service-partners": (html) => { /* custom extraction */ },
  "wrench-group": (html) => { /* custom extraction */ },
};
```

For platforms without custom extractors, the system falls back to OpenAI-based extraction.

### API Usage

```bash
# Trigger platform monitoring manually
curl -X POST https://your-domain.vercel.app/api/scrape \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_SCRAPER_API_KEY" \
  -d '{"type": "platforms"}'
```

### Response Example

```json
{
  "success": true,
  "type": "platforms",
  "result": {
    "platformsMonitored": 5,
    "totalBrandsFound": 127,
    "totalBrandsAdded": 2,
    "totalBrandsRemoved": 0,
    "duration": 60000
  }
}
```

### Configuring a Platform for Monitoring

1. Ensure the platform has a `brandsPageUrl` in the database:

```sql
UPDATE "Platform"
SET "brandsPageUrl" = 'https://silaservices.com/brands/'
WHERE slug = 'sila-services';
```

2. (Optional) Add a custom extractor in `platform-monitor.ts` if the default extraction doesn't work well.

### Diff Detection Logic

```typescript
function diffBrandLists(oldBrands: string[], newBrands: string[]): DiffResult {
  const oldSet = new Set(oldBrands.map(b => b.toLowerCase()));
  const newSet = new Set(newBrands.map(b => b.toLowerCase()));

  return {
    added: newBrands.filter(b => !oldSet.has(b.toLowerCase())),
    removed: oldBrands.filter(b => !newSet.has(b.toLowerCase())),
  };
}
```

---

## Cron Schedule

Configured in `vercel.json`:

| Job | Schedule | Sources |
|-----|----------|---------|
| Daily | Every 6 hours (`0 */6 * * *`) | RSS feeds, Gmail alerts, News |
| Weekly | Monday 8am (`0 8 * * 1`) | Platform monitoring, Portfolio |

### Cron Endpoint

```
GET /api/cron?type=daily   # RSS, Gmail, News
GET /api/cron?type=weekly  # Platforms, Portfolio
GET /api/cron?type=full    # All scrapers
```

Requires `Authorization: Bearer CRON_SECRET` header in production.

---

## Logging & Monitoring

### ScrapeSource Table
Tracks each data source configuration:
- `name`: Human-readable name
- `url`: Feed/page URL
- `sourceType`: `rss_news`, `rss_press`, `platform_brands_page`, `gmail_alerts`
- `lastScrapedAt`: Timestamp of last scrape
- `consecutiveFailures`: Error tracking

### ScrapeLog Table
Records each scrape execution:
- `startedAt` / `completedAt`: Timing
- `status`: `success`, `partial`, `failed`
- `recordsFound`: Total items discovered
- `recordsNew`: New items stored
- `errorMessage`: Any errors encountered

### Viewing Logs

```sql
-- Recent scrape activity
SELECT
  ss.name,
  sl.status,
  sl."recordsFound",
  sl."recordsNew",
  sl."startedAt"
FROM "ScrapeLog" sl
JOIN "ScrapeSource" ss ON sl."sourceId" = ss.id
ORDER BY sl."startedAt" DESC
LIMIT 20;
```

---

## Troubleshooting

### RSS Feed Not Returning Articles
1. Check if the feed URL is accessible: `curl -I <feed_url>`
2. Verify the feed format is valid RSS/Atom
3. Check ScrapeLog for error messages

### Platform Monitoring Missing Brands
1. Verify `brandsPageUrl` is correct in database
2. Check if the page requires JavaScript rendering (Puppeteer handles this)
3. Consider adding a custom extractor for the platform's HTML structure

### High False Positive Rate
The relevance threshold can be adjusted in the extraction code:
```typescript
// In rss-feeds.ts or platform-monitor.ts
if (!relevance.isRelevant || relevance.confidence < 40) {
  // Increase 40 to reduce false positives
}
```
