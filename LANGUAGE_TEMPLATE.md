# aireshark Language Template

Edit the text below, then paste this file back to Claude to update the site copy.

---

## Site-Wide Settings

### Brand Name
```
aireshark
```

### Industry Focus
```
HVAC
```

### Full Industry Name
```
residential heating and cooling
```

---

## Metadata (SEO)

### Site Title
```
aireshark - Intelligence for Consolidated HVAC
```

### Site Description
```
Track private equity acquisitions and consolidation in the residential HVAC industry. Real-time intelligence on PE firms, acquired brands, and market activity.
```

### SEO Keywords
```
HVAC private equity, HVAC acquisitions, home services M&A, PE consolidation tracker, HVAC industry intelligence, private equity tracker
```

### Open Graph Description
```
Real-time intelligence on private equity activity in the HVAC industry.
```

### Twitter Description
```
Private equity intelligence for the HVAC industry.
```

---

## Homepage

### Hero Headline
```
Intelligence for Consolidated HVAC.
```

### Hero Subheadline
```
Track acquisitions, ownership changes, and market consolidation across the residential heating and cooling industry.
```

### Primary Button Text
```
Explore Platforms
```

### Secondary Button Text
```
View Brands
```

### Stats Section Labels
```
Platforms
Brands
Deals
Industry
```

### Top Platforms Section
- Badge: `Market Leaders`
- Headline: `Top Platforms`
- Description: `The largest PE-backed consolidators in HVAC`
- Empty State: `No data available yet.`
- View All Button: `View all platforms`

### Recent Activity Section
- Badge: `Live Data`
- Headline: `Recent Activity`
- Description: `Latest acquisitions and market moves`
- Table Headers: `Brand | Seller | Platform | Date | Value`
- Default Seller: `Independent`
- Empty State: `No acquisitions recorded yet.`
- Unknown Brand: `Unknown`
- Undisclosed Value: `Undisclosed`

### CTA Section
- Headline: `Stay ahead of the market.`
- Description: `aireshark continuously monitors news sources, press releases, and platform portfolios to surface the latest acquisition activity in residential HVAC.`
- Button: `Start Exploring`

---

## Platforms Page

### Hero
- Badge: `Directory`
- Headline: `Platforms`
- Description: `PE-backed consolidators rolling up the residential HVAC industry`

### Platform Card Labels
```
Brands
Est.
Backed by
```

### Default Description
```
HVAC consolidation platform.
```

### Empty State
- Headline: `No Data Yet`
- Description: `Set up your database and run the seed script to populate platforms.`

---

## Platform Detail Page

### Back Link
```
Back to Platforms
```

### Stats Labels
```
Brands
Acquisitions
Valuation
Founded
```

### Section Headings
```
About
Acquisitions by Year
Portfolio Brands
Related Articles
```

### Button
```
Visit Website →
```

### Empty Brands
```
No brands recorded yet.
```

---

## Brands Page

### Hero
- Badge: `Portfolio`
- Headline: `Brands`
- Description: `HVAC companies acquired by PE-backed platforms`

### Table Headers
```
Brand | Platform | Location | Acquired | Value
```

### Empty State
- Headline: `No Data Yet`
- Description: `Set up your database and run the seed script to populate brands.`

---

## Brand Detail Page

### Back Link
```
← Back to Brands
```

### Section Headings
```
About
Acquisition Details
Related Articles
Quick Info
Parent Company
```

### Acquisition Detail Labels
```
Acquired By
Acquisition Date
Deal Value
Service Area
```

### Quick Info Labels
```
Location
Service Area
Website
```

### Defaults
```
Unknown
Undisclosed
Local/Regional
```

### Link Text
```
View PE Profile →
```

---

## Articles Page

### Hero
- Badge: `Intelligence`
- Headline: `Articles`
- Description: `Latest news and updates from the HVAC industry`

### Article Type Labels
```
Acquisition
Expansion
Leadership
Industry
News
```

### Empty State
- Headline: `No Articles Yet`
- Description: `Articles will appear here as they are discovered by the scraper.`
- Help Text: `Run the scraper from the Admin panel to fetch articles.`

---

## Navigation

### Menu Items
```
Platforms
Brands
Articles
Admin
```

---

## Footer

### Tagline
```
aireshark — Private equity intelligence for HVAC
```

### Links
```
Platforms
Brands
Articles
```

---

## Error States

### Platform Not Found
```
Platform Not Found
```

### Brand Not Found
```
Brand Not Found
```

---

## Instructions for Claude

When updating the language:
1. Replace text strings in the TSX files matching the old values with the new values
2. Update metadata in `app/layout.tsx`
3. Update navigation labels in `components/MobileNav.tsx`
4. Ensure all instances of the brand name are updated consistently
