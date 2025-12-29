-- ============================================
-- AIRESHARK SCHEMA ADDITIONS
-- Adapted to match existing schema conventions
-- ============================================

-- ============================================
-- NEW TABLE: Platform
-- This is the PE-backed consolidator (Apex, Wrench, Sila, etc.)
-- Sits between PrivateEquityFirm and Brand
-- ============================================

CREATE TABLE public.Platform (
  id text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  website text,
  logoUrl text,
  brandsPageUrl text,                    -- URL to their portfolio/brands page if exists
  headquarters text,
  foundedYear integer,
  estimatedPortfolioSize text,           -- e.g., "100-200", "50+"
  employeeCount integer,
  valuationMillions numeric(12,2),
  isActive boolean NOT NULL DEFAULT true,
  notes text,
  lastScrapedAt timestamp without time zone,
  privateEquityFirmId text,              -- The PE sponsor (Alpine, Leonard Green, etc.)
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Platform_pkey PRIMARY KEY (id),
  CONSTRAINT Platform_slug_key UNIQUE (slug),
  CONSTRAINT Platform_privateEquityFirmId_fkey FOREIGN KEY (privateEquityFirmId) REFERENCES public.PrivateEquityFirm(id)
);

-- ============================================
-- MODIFY: Brand table
-- Add platformId to link brands to their platform
-- ============================================

-- Add new column to Brand
ALTER TABLE public.Brand 
ADD COLUMN platformId text,
ADD CONSTRAINT Brand_platformId_fkey FOREIGN KEY (platformId) REFERENCES public.Platform(id);

-- Add additional useful columns to Brand (optional)
ALTER TABLE public.Brand
ADD COLUMN city text,
ADD COLUMN state text,
ADD COLUMN phone text,
ADD COLUMN email text,
ADD COLUMN services text[],              -- Array: ['HVAC', 'Plumbing', 'Electrical']
ADD COLUMN foundedYear integer,
ADD COLUMN employeeCount integer,
ADD COLUMN isVerified boolean DEFAULT false,
ADD COLUMN verificationDate timestamp without time zone,
ADD COLUMN verificationSource text;

-- ============================================
-- MODIFY: Acquisition table  
-- Add platformId since platforms make acquisitions
-- ============================================

ALTER TABLE public.Acquisition
ADD COLUMN platformId text,
ADD CONSTRAINT Acquisition_platformId_fkey FOREIGN KEY (platformId) REFERENCES public.Platform(id);

-- ============================================
-- MODIFY: Article table
-- Add platformId for articles about platforms
-- ============================================

ALTER TABLE public.Article
ADD COLUMN platformId text,
ADD COLUMN articleType text,             -- 'acquisition', 'expansion', 'leadership', 'industry'
ADD COLUMN isProcessed boolean DEFAULT false,
ADD COLUMN processedAt timestamp without time zone,
ADD CONSTRAINT Article_platformId_fkey FOREIGN KEY (platformId) REFERENCES public.Platform(id);

-- ============================================
-- NEW TABLE: ScrapeSource
-- Track scraping sources and their status
-- ============================================

CREATE TABLE public.ScrapeSource (
  id text NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  sourceType text,                       -- 'platform_brands_page', 'news_feed', 'press_release'
  scrapeFrequencyHours integer DEFAULT 24,
  selectorConfig jsonb,                  -- CSS selectors, XPath, etc.
  isActive boolean NOT NULL DEFAULT true,
  lastScrapedAt timestamp without time zone,
  lastSuccessAt timestamp without time zone,
  consecutiveFailures integer DEFAULT 0,
  platformId text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT ScrapeSource_pkey PRIMARY KEY (id),
  CONSTRAINT ScrapeSource_platformId_fkey FOREIGN KEY (platformId) REFERENCES public.Platform(id)
);

-- ============================================
-- NEW TABLE: ScrapeLog
-- Log all scraping runs
-- ============================================

CREATE TABLE public.ScrapeLog (
  id text NOT NULL,
  sourceId text NOT NULL,
  startedAt timestamp without time zone NOT NULL,
  completedAt timestamp without time zone,
  status text,                           -- 'success', 'partial', 'failed'
  recordsFound integer,
  recordsNew integer,
  recordsUpdated integer,
  errorMessage text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ScrapeLog_pkey PRIMARY KEY (id),
  CONSTRAINT ScrapeLog_sourceId_fkey FOREIGN KEY (sourceId) REFERENCES public.ScrapeSource(id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_Platform_privateEquityFirmId ON public.Platform(privateEquityFirmId);
CREATE INDEX idx_Platform_slug ON public.Platform(slug);

CREATE INDEX idx_Brand_platformId ON public.Brand(platformId);
CREATE INDEX idx_Brand_state ON public.Brand(state);
CREATE INDEX idx_Brand_services ON public.Brand USING GIN(services);

CREATE INDEX idx_Acquisition_platformId ON public.Acquisition(platformId);
CREATE INDEX idx_Acquisition_date ON public.Acquisition(date DESC);

CREATE INDEX idx_Article_platformId ON public.Article(platformId);
CREATE INDEX idx_Article_publishedDate ON public.Article(publishedDate DESC);
CREATE INDEX idx_Article_articleType ON public.Article(articleType);

-- ============================================
-- VIEWS
-- ============================================

-- Platform summary with brand counts
CREATE OR REPLACE VIEW public.PlatformSummary AS
SELECT 
    p.id,
    p.name,
    p.slug,
    pe.name as privateEquityFirmName,
    p.headquarters,
    p.foundedYear,
    p.website,
    p.estimatedPortfolioSize,
    COUNT(b.id) as brandCount,
    COUNT(CASE WHEN b.isVerified THEN 1 END) as verifiedBrandCount,
    MAX(a.date) as lastAcquisitionDate
FROM public.Platform p
LEFT JOIN public.PrivateEquityFirm pe ON p.privateEquityFirmId = pe.id
LEFT JOIN public.Brand b ON b.platformId = p.id
LEFT JOIN public.Acquisition a ON a.platformId = p.id
GROUP BY p.id, p.name, p.slug, pe.name, p.headquarters, p.foundedYear, p.website, p.estimatedPortfolioSize;

-- Recent acquisitions view
CREATE OR REPLACE VIEW public.RecentAcquisitions AS
SELECT 
    a.*,
    p.name as platformName,
    pe.name as privateEquityFirmName,
    b.name as brandName
FROM public.Acquisition a
LEFT JOIN public.Platform p ON a.platformId = p.id
LEFT JOIN public.PrivateEquityFirm pe ON a.privateEquityFirmId = pe.id
LEFT JOIN public.Brand b ON a.brandId = b.id
ORDER BY a.date DESC;
