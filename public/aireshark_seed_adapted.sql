-- ============================================
-- AIRESHARK SEED DATA
-- Adapted to match existing schema conventions
-- ============================================

-- Note: You'll need to generate text IDs in your application
-- These use placeholder IDs - replace with your ID generation method
-- (e.g., cuid, nanoid, uuid cast to text)

-- ============================================
-- PE FIRMS (PrivateEquityFirm)
-- Only insert if they don't already exist
-- ============================================

INSERT INTO public."PrivateEquityFirm" (id, name, slug, description, website, headquarters, foundedYear, "assetsUnderManagement", "createdAt", "updatedAt")
VALUES
  ('pe_alpine', 'Alpine Investors', 'alpine-investors', 'People-driven PE firm focused on software and services', 'alpineinvestors.com', 'San Francisco, CA', 2001, '$16B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pe_leonardgreen', 'Leonard Green & Partners', 'leonard-green-partners', 'Los Angeles-based private equity firm', 'leonardgreen.com', 'Los Angeles, CA', 1989, '$75B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pe_goldmansachs', 'Goldman Sachs Alternatives', 'goldman-sachs-alternatives', 'Part of Goldman Sachs Asset Management', 'gsam.com', 'New York, NY', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pe_roark', 'Roark Capital', 'roark-capital', 'Atlanta-based PE firm focused on franchise and services', 'roarkcapital.com', 'Atlanta, GA', 2001, '$37B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pe_gridiron', 'Gridiron Capital', 'gridiron-capital', 'Middle-market PE firm', 'gridironcapital.com', 'New Canaan, CT', 2006, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pe_morganstanley', 'Morgan Stanley Capital Partners', 'morgan-stanley-capital-partners', 'Middle-market PE platform', 'morganstanley.com/im', 'New York, NY', 1985, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pe_investcorp', 'Investcorp', 'investcorp', 'Global alternative investment firm', 'investcorp.com', 'New York, NY', 1982, '$52B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PLATFORMS
-- The PE-backed consolidators from the market map
-- ============================================

INSERT INTO public."Platform" (id, name, slug, description, website, "brandsPageUrl", headquarters, "foundedYear", "estimatedPortfolioSize", "employeeCount", "valuationMillions", notes, "privateEquityFirmId", "createdAt", "updatedAt")
VALUES
  -- Tier 1: Fully Researched
  ('plat_apex', 'Apex Service Partners', 'apex-service-partners', 'Residential HVAC, plumbing, and electrical services platform', 'apexservicepartners.com', NULL, 'Tampa, FL', 2019, '100-200', 8000, 3400, '$3.4B valuation (2023 continuation fund). One of the largest platforms.', 'pe_alpine', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_wrench', 'Wrench Group', 'wrench-group', 'National leader in home maintenance and repair services', 'wrenchgroup.com', NULL, 'Atlanta, GA', 2016, '50-100', NULL, NULL, 'Originally Alpine/Investcorp, sold to LGP in 2019. Core brands: Coolray, Berkeys, Abacus, Parker & Sons', 'pe_leonardgreen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_sila', 'Sila Services', 'sila-services', 'Leading home services platform for HVAC, Plumbing, and Electrical in Northeast/Mid-Atlantic/Midwest', 'silaservices.com', 'silaservices.com/brands/', 'King of Prussia, PA', 1989, '35+', 2000, NULL, 'HAS BRANDS PAGE - scrape this! Acquired by Goldman from MSCP in late 2024.', 'pe_goldmansachs', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Tier 2: Partially Researched
  ('plat_legacy', 'Legacy Service Partners', 'legacy-service-partners', NULL, 'legacyservicepartners.com', NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', 'pe_roark', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_turnpoint', 'Turnpoint', 'turnpoint', NULL, 'turnpointservices.com', NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', 'pe_gridiron', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Tier 3: From Market Map - Need Research
  ('plat_heartland', 'Heartland', 'heartland', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_anyhour', 'Any Hour Group', 'any-hour-group', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_leap', 'Leap Partners', 'leap-partners', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_liberty', 'Liberty Service Partners', 'liberty-service-partners', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_granite', 'Granite Comfort', 'granite-comfort', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_resixperts', 'ResiXperts', 'resixperts', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_seacoast', 'Seacoast', 'seacoast', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_ally', 'Ally', 'ally', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_homex', 'Home X', 'home-x', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_fixit', 'Fix-It', 'fix-it', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_friendly', 'Friendly Group', 'friendly-group', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_chill', 'Chill Brothers', 'chill-brothers', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_mastertrades', 'Master Trades', 'master-trades', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_intermountain', 'Intermountain', 'intermountain', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_northwinds', 'Northwinds', 'northwinds', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_cascade', 'Cascade Services', 'cascade-services', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_columbia', 'Columbia', 'columbia', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_p1', 'P1 Service Group', 'p1-service-group', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_strikepoint', 'Strikepoint', 'strikepoint', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_nearu', 'NearU', 'nearu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_copperpoint', 'CopperPoint', 'copperpoint', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_bluecardinal', 'Blue Cardinal', 'blue-cardinal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_unitedflow', 'United Flow', 'united-flow', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_southeast', 'Southeast Mechanical', 'southeast-mechanical', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_flint', 'Flint Group', 'flint-group', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research - not the printing company', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_clarion', 'Clarion', 'clarion', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_ace', 'Ace Hardware', 'ace-hardware', 'Cooperative retailer with Ace Handyman Services franchise', 'acehardware.com', NULL, 'Oak Brook, IL', 1924, NULL, NULL, NULL, 'Different model - cooperative/franchise, not PE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_logan', 'Logan', 'logan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_airmakers', 'Airmakers', 'airmakers', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_excel', 'Excel', 'excel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_triangle', 'Triangle', 'triangle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_coastalair', 'Coastal Air', 'coastal-air', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_nauman', 'Nauman', 'nauman', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_beutler', 'Beutler', 'beutler', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_cooltoday', 'CoolToday', 'cooltoday', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_plumbline', 'Plumbline', 'plumbline', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_parkernexgen', 'Parker Nexgen', 'parker-nexgen', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_champions', 'Champions', 'champions', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_seer', 'Seer', 'seer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_redwood', 'Redwood', 'redwood', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Redwood Services - needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_hometown', 'HomeTown', 'hometown', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_southern', 'Southern', 'southern', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plat_gmp', 'GMP', 'gmp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Needs research', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BRANDS (Portfolio Companies)
-- Verified from web research
-- ============================================

-- Apex Service Partners brands
INSERT INTO public."Brand" (id, name, slug, website, location, city, state, "foundedYear", "acquisitionDate", "privateEquityFirmId", "platformId", "isVerified", "verificationSource", "createdAt", "updatedAt")
VALUES
  ('brand_besthome', 'Best Home Services', 'best-home-services', 'getbest.com', 'Naples, FL', 'Naples', 'FL', 1980, '2019-06-01', 'pe_alpine', 'plat_apex', true, 'https://alpineinvestors.com/update/alpine-launches-apex-service-partners/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_frankgay', 'Frank Gay Services', 'frank-gay-services', 'frankgayservices.com', 'Orlando, FL', 'Orlando', 'FL', 1981, '2019-07-01', 'pe_alpine', 'plat_apex', true, 'https://www.businesswire.com/news/home/20190729005183/en/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_southernair', 'Southern Air Heating & Cooling', 'southern-air', NULL, 'Ball, LA', 'Ball', 'LA', 1994, '2019-10-01', 'pe_alpine', 'plat_apex', true, 'https://peprofessional.com/2019/10/alpine-closes-third-home-services-buy/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_academyair', 'Academy Air', 'academy-air', NULL, 'St. Louis, MO', 'St. Louis', 'MO', NULL, '2020-07-01', 'pe_alpine', 'plat_apex', true, 'BusinessWire', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_belred', 'BelRed Energy Solutions', 'belred', 'belred.com', 'Seattle, WA', 'Seattle', 'WA', NULL, '2022-01-01', 'pe_alpine', 'plat_apex', true, 'PRNewswire', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_dilling', 'Dilling Heating & Cooling', 'dilling', NULL, 'Charlotte, NC', 'Charlotte', 'NC', NULL, '2022-01-01', 'pe_alpine', 'plat_apex', true, 'Tracxn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_coastal', 'Coastal Home Services', 'coastal-home-services', NULL, 'North Carolina', NULL, 'NC', NULL, NULL, 'pe_alpine', 'plat_apex', true, 'LeadIQ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_reimer', 'Reimer', 'reimer', NULL, 'Buffalo, NY', 'Buffalo', 'NY', NULL, NULL, 'pe_alpine', 'plat_apex', true, 'https://apexservicepartners.com/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_haley', 'Haley Mechanical', 'haley-mechanical', NULL, 'Ann Arbor, MI', 'Ann Arbor', 'MI', NULL, '2024-01-01', 'pe_alpine', 'plat_apex', true, 'Via Frontier acquisition', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_korte', 'Korte Does It All', 'korte-does-it-all', NULL, 'Fort Wayne, IN', 'Fort Wayne', 'IN', NULL, '2024-01-01', 'pe_alpine', 'plat_apex', true, 'Via Frontier acquisition', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_abmay', 'AB May', 'ab-may', NULL, 'Kansas City, MO', 'Kansas City', 'MO', NULL, '2024-01-01', 'pe_alpine', 'plat_apex', true, 'Via Frontier acquisition', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_homebreeze', 'HomeBreeze', 'homebreeze', NULL, 'California', NULL, 'CA', 2021, '2024-11-01', 'pe_alpine', 'plat_apex', true, 'Y Combinator-backed tech startup', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Wrench Group brands
INSERT INTO public."Brand" (id, name, slug, website, location, city, state, "privateEquityFirmId", "platformId", "isVerified", "verificationSource", "createdAt", "updatedAt")
VALUES
  ('brand_coolray', 'Coolray', 'coolray', 'coolray.com', 'Atlanta, GA', 'Atlanta', 'GA', 'pe_leonardgreen', 'plat_wrench', true, 'Founding brand', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_mrplumber', 'Mr. Plumber', 'mr-plumber', NULL, 'Atlanta, GA', 'Atlanta', 'GA', 'pe_leonardgreen', 'plat_wrench', true, 'Part of Coolray family', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_britebox', 'BriteBox', 'britebox', NULL, 'Atlanta, GA', 'Atlanta', 'GA', 'pe_leonardgreen', 'plat_wrench', true, 'Part of Coolray family', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_berkeys', 'Berkeys', 'berkeys', 'berkeys.com', 'Dallas, TX', 'Dallas', 'TX', 'pe_leonardgreen', 'plat_wrench', true, 'Founding brand', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_abacus', 'Abacus', 'abacus', 'abacusplumbing.com', 'Houston, TX', 'Houston', 'TX', 'pe_leonardgreen', 'plat_wrench', true, 'Founding brand', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_parkersons', 'Parker & Sons', 'parker-sons', 'parkerandsons.com', 'Phoenix, AZ', 'Phoenix', 'AZ', 'pe_leonardgreen', 'plat_wrench', true, 'Founding brand', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SCRAPE SOURCES
-- ============================================

INSERT INTO public."ScrapeSource" (id, name, url, "sourceType", "scrapeFrequencyHours", "selectorConfig", "isActive", "platformId", "createdAt", "updatedAt")
VALUES
  ('src_sila_brands', 'Sila Services Brands Page', 'https://silaservices.com/brands/', 'platform_brands_page', 168, '{"type": "html", "container": ".brand-card"}', true, 'plat_sila', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('src_achr_ma', 'ACHR News - M&A', 'https://www.achrnews.com/topics/2669-mergers-acquisitions', 'news_feed', 24, '{"type": "html"}', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('src_contracting_ma', 'Contracting Business - M&A', 'https://www.contractingbusiness.com/mergers-acquisitions', 'news_feed', 24, '{"type": "html"}', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('src_businesswire', 'BusinessWire - HVAC', 'https://www.businesswire.com/', 'press_release', 12, '{"type": "search", "query": "HVAC acquires"}', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
