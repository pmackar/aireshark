import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding platforms and extended data...\n");

  // PE Firms - upsert to avoid conflicts
  const peFirms = [
    { id: "pe_alpine", name: "Alpine Investors", slug: "alpine-investors", description: "People-driven PE firm focused on software and services", website: "alpineinvestors.com", headquarters: "San Francisco, CA", foundedYear: 2001, assetsUnderManagement: "$16B" },
    { id: "pe_leonardgreen", name: "Leonard Green & Partners", slug: "leonard-green-partners", description: "Los Angeles-based private equity firm", website: "leonardgreen.com", headquarters: "Los Angeles, CA", foundedYear: 1989, assetsUnderManagement: "$75B" },
    { id: "pe_goldmansachs", name: "Goldman Sachs Alternatives", slug: "goldman-sachs-alternatives", description: "Part of Goldman Sachs Asset Management", website: "gsam.com", headquarters: "New York, NY", foundedYear: null, assetsUnderManagement: null },
    { id: "pe_roark", name: "Roark Capital", slug: "roark-capital", description: "Atlanta-based PE firm focused on franchise and services", website: "roarkcapital.com", headquarters: "Atlanta, GA", foundedYear: 2001, assetsUnderManagement: "$37B" },
    { id: "pe_gridiron", name: "Gridiron Capital", slug: "gridiron-capital", description: "Middle-market PE firm", website: "gridironcapital.com", headquarters: "New Canaan, CT", foundedYear: 2006, assetsUnderManagement: null },
    { id: "pe_morganstanley", name: "Morgan Stanley Capital Partners", slug: "morgan-stanley-capital-partners", description: "Middle-market PE platform", website: "morganstanley.com/im", headquarters: "New York, NY", foundedYear: 1985, assetsUnderManagement: null },
    { id: "pe_investcorp", name: "Investcorp", slug: "investcorp", description: "Global alternative investment firm", website: "investcorp.com", headquarters: "New York, NY", foundedYear: 1982, assetsUnderManagement: "$52B" },
  ];

  console.log("Creating/updating PE firms...");
  for (const firm of peFirms) {
    await prisma.privateEquityFirm.upsert({
      where: { slug: firm.slug },
      update: { ...firm, id: undefined },
      create: firm,
    });
  }
  console.log(`  ${peFirms.length} PE firms processed`);

  // Platforms
  const platforms = [
    { id: "plat_apex", name: "Apex Service Partners", slug: "apex-service-partners", description: "Residential HVAC, plumbing, and electrical services platform", website: "apexservicepartners.com", headquarters: "Tampa, FL", foundedYear: 2019, estimatedPortfolioSize: "100-200", employeeCount: 8000, valuationMillions: 3400, notes: "$3.4B valuation (2023 continuation fund). One of the largest platforms.", peSlug: "alpine-investors" },
    { id: "plat_wrench", name: "Wrench Group", slug: "wrench-group", description: "National leader in home maintenance and repair services", website: "wrenchgroup.com", headquarters: "Atlanta, GA", foundedYear: 2016, estimatedPortfolioSize: "50-100", notes: "Originally Alpine/Investcorp, sold to LGP in 2019. Core brands: Coolray, Berkeys, Abacus, Parker & Sons", peSlug: "leonard-green-partners" },
    { id: "plat_sila", name: "Sila Services", slug: "sila-services", description: "Leading home services platform for HVAC, Plumbing, and Electrical in Northeast/Mid-Atlantic/Midwest", website: "silaservices.com", brandsPageUrl: "silaservices.com/brands/", headquarters: "King of Prussia, PA", foundedYear: 1989, estimatedPortfolioSize: "35+", employeeCount: 2000, notes: "HAS BRANDS PAGE - scrape this! Acquired by Goldman from MSCP in late 2024.", peSlug: "goldman-sachs-alternatives" },
    { id: "plat_legacy", name: "Legacy Service Partners", slug: "legacy-service-partners", website: "legacyservicepartners.com", notes: "Needs research", peSlug: "roark-capital" },
    { id: "plat_turnpoint", name: "Turnpoint", slug: "turnpoint", website: "turnpointservices.com", notes: "Needs research", peSlug: "gridiron-capital" },
    // Platforms needing research (no PE sponsor assigned yet)
    { id: "plat_heartland", name: "Heartland", slug: "heartland-platform", notes: "Needs research" },
    { id: "plat_anyhour", name: "Any Hour Group", slug: "any-hour-group-platform", notes: "Needs research" },
    { id: "plat_leap", name: "Leap Partners", slug: "leap-partners", notes: "Needs research" },
    { id: "plat_liberty", name: "Liberty Service Partners", slug: "liberty-service-partners", notes: "Needs research" },
    { id: "plat_granite", name: "Granite Comfort", slug: "granite-comfort", notes: "Needs research" },
    { id: "plat_resixperts", name: "ResiXperts", slug: "resixperts", notes: "Needs research" },
    { id: "plat_seacoast", name: "Seacoast", slug: "seacoast", notes: "Needs research" },
    { id: "plat_ally", name: "Ally", slug: "ally-platform", notes: "Needs research" },
    { id: "plat_homex", name: "Home X", slug: "home-x", notes: "Needs research" },
    { id: "plat_fixit", name: "Fix-It", slug: "fix-it", notes: "Needs research" },
    { id: "plat_friendly", name: "Friendly Group", slug: "friendly-group", notes: "Needs research" },
    { id: "plat_chill", name: "Chill Brothers", slug: "chill-brothers", notes: "Needs research" },
    { id: "plat_mastertrades", name: "Master Trades", slug: "master-trades", notes: "Needs research" },
    { id: "plat_intermountain", name: "Intermountain", slug: "intermountain", notes: "Needs research" },
    { id: "plat_northwinds", name: "Northwinds", slug: "northwinds", notes: "Needs research" },
    { id: "plat_cascade", name: "Cascade Services", slug: "cascade-services", notes: "Needs research" },
    { id: "plat_columbia", name: "Columbia", slug: "columbia-platform", notes: "Needs research" },
    { id: "plat_p1", name: "P1 Service Group", slug: "p1-service-group", notes: "Needs research" },
    { id: "plat_strikepoint", name: "Strikepoint", slug: "strikepoint", notes: "Needs research" },
    { id: "plat_nearu", name: "NearU", slug: "nearu", notes: "Needs research" },
    { id: "plat_copperpoint", name: "CopperPoint", slug: "copperpoint", notes: "Needs research" },
    { id: "plat_bluecardinal", name: "Blue Cardinal", slug: "blue-cardinal", notes: "Needs research" },
    { id: "plat_unitedflow", name: "United Flow", slug: "united-flow", notes: "Needs research" },
    { id: "plat_southeast", name: "Southeast Mechanical", slug: "southeast-mechanical", notes: "Needs research" },
    { id: "plat_flint", name: "Flint Group", slug: "flint-group", notes: "Needs research - not the printing company" },
    { id: "plat_clarion", name: "Clarion", slug: "clarion", notes: "Needs research" },
    { id: "plat_ace", name: "Ace Hardware", slug: "ace-hardware", description: "Cooperative retailer with Ace Handyman Services franchise", website: "acehardware.com", headquarters: "Oak Brook, IL", foundedYear: 1924, notes: "Different model - cooperative/franchise, not PE" },
    { id: "plat_logan", name: "Logan", slug: "logan-platform", notes: "Needs research" },
    { id: "plat_airmakers", name: "Airmakers", slug: "airmakers", notes: "Needs research" },
    { id: "plat_excel", name: "Excel", slug: "excel-platform", notes: "Needs research" },
    { id: "plat_triangle", name: "Triangle", slug: "triangle-platform", notes: "Needs research" },
    { id: "plat_coastalair", name: "Coastal Air", slug: "coastal-air", notes: "Needs research" },
    { id: "plat_cooltoday", name: "CoolToday", slug: "cooltoday", notes: "Needs research" },
    { id: "plat_plumbline", name: "Plumbline", slug: "plumbline", notes: "Needs research" },
    { id: "plat_parkernexgen", name: "Parker Nexgen", slug: "parker-nexgen", notes: "Needs research" },
    { id: "plat_champions", name: "Champions", slug: "champions", notes: "Needs research" },
    { id: "plat_redwood", name: "Redwood", slug: "redwood-platform", notes: "Redwood Services - needs research" },
    { id: "plat_hometown", name: "HomeTown", slug: "hometown", notes: "Needs research" },
    { id: "plat_southern", name: "Southern", slug: "southern-platform", notes: "Needs research" },
    { id: "plat_gmp", name: "GMP", slug: "gmp", notes: "Needs research" },
  ];

  console.log("\nCreating/updating platforms...");
  let platformCount = 0;
  for (const p of platforms) {
    const { peSlug, ...platformData } = p as typeof p & { peSlug?: string };

    // Find PE firm if specified
    let privateEquityFirmId: string | null = null;
    if (peSlug) {
      const peFirm = await prisma.privateEquityFirm.findUnique({ where: { slug: peSlug } });
      if (peFirm) privateEquityFirmId = peFirm.id;
    }

    await prisma.platform.upsert({
      where: { slug: platformData.slug },
      update: {
        ...platformData,
        id: undefined,
        privateEquityFirmId,
        valuationMillions: platformData.valuationMillions || null,
      },
      create: {
        ...platformData,
        privateEquityFirmId,
        valuationMillions: platformData.valuationMillions || null,
      },
    });
    platformCount++;
  }
  console.log(`  ${platformCount} platforms processed`);

  // Brands for Apex
  const apexBrands = [
    { name: "Best Home Services", slug: "best-home-services", website: "getbest.com", city: "Naples", state: "FL", foundedYear: 1980, acquisitionDate: new Date("2019-06-01"), isVerified: true, verificationSource: "https://alpineinvestors.com/update/alpine-launches-apex-service-partners/" },
    { name: "Frank Gay Services", slug: "frank-gay-services", website: "frankgayservices.com", city: "Orlando", state: "FL", foundedYear: 1981, acquisitionDate: new Date("2019-07-01"), isVerified: true, verificationSource: "BusinessWire" },
    { name: "Southern Air Heating & Cooling", slug: "southern-air-hvac", city: "Ball", state: "LA", foundedYear: 1994, acquisitionDate: new Date("2019-10-01"), isVerified: true, verificationSource: "PE Professional" },
    { name: "Academy Air", slug: "academy-air", city: "St. Louis", state: "MO", acquisitionDate: new Date("2020-07-01"), isVerified: true, verificationSource: "BusinessWire" },
    { name: "BelRed Energy Solutions", slug: "belred", website: "belred.com", city: "Seattle", state: "WA", acquisitionDate: new Date("2022-01-01"), isVerified: true, verificationSource: "PRNewswire" },
    { name: "Dilling Heating & Cooling", slug: "dilling", city: "Charlotte", state: "NC", acquisitionDate: new Date("2022-01-01"), isVerified: true, verificationSource: "Tracxn" },
    { name: "Coastal Home Services", slug: "coastal-home-services", state: "NC", isVerified: true, verificationSource: "LeadIQ" },
    { name: "Reimer", slug: "reimer", city: "Buffalo", state: "NY", isVerified: true, verificationSource: "apexservicepartners.com" },
    { name: "Haley Mechanical", slug: "haley-mechanical", city: "Ann Arbor", state: "MI", acquisitionDate: new Date("2024-01-01"), isVerified: true, verificationSource: "Via Frontier acquisition" },
    { name: "Korte Does It All", slug: "korte-does-it-all", city: "Fort Wayne", state: "IN", acquisitionDate: new Date("2024-01-01"), isVerified: true, verificationSource: "Via Frontier acquisition" },
    { name: "AB May", slug: "ab-may", city: "Kansas City", state: "MO", acquisitionDate: new Date("2024-01-01"), isVerified: true, verificationSource: "Via Frontier acquisition" },
    { name: "HomeBreeze", slug: "homebreeze-apex", state: "CA", foundedYear: 2021, acquisitionDate: new Date("2024-11-01"), isVerified: true, verificationSource: "Y Combinator-backed tech startup" },
  ];

  // Get Apex platform and Alpine PE firm
  const apexPlatform = await prisma.platform.findUnique({ where: { slug: "apex-service-partners" } });
  const alpineFirm = await prisma.privateEquityFirm.findUnique({ where: { slug: "alpine-investors" } });

  console.log("\nCreating/updating Apex brands...");
  if (apexPlatform && alpineFirm) {
    for (const brand of apexBrands) {
      await prisma.brand.upsert({
        where: { slug: brand.slug },
        update: { ...brand, location: brand.city && brand.state ? `${brand.city}, ${brand.state}` : brand.state, platformId: apexPlatform.id, privateEquityFirmId: alpineFirm.id },
        create: { ...brand, location: brand.city && brand.state ? `${brand.city}, ${brand.state}` : brand.state, platformId: apexPlatform.id, privateEquityFirmId: alpineFirm.id },
      });
    }
    console.log(`  ${apexBrands.length} Apex brands processed`);
  }

  // Brands for Wrench Group
  const wrenchBrands = [
    { name: "Coolray", slug: "coolray", website: "coolray.com", city: "Atlanta", state: "GA", isVerified: true, verificationSource: "Founding brand" },
    { name: "Mr. Plumber", slug: "mr-plumber", city: "Atlanta", state: "GA", isVerified: true, verificationSource: "Part of Coolray family" },
    { name: "BriteBox", slug: "britebox", city: "Atlanta", state: "GA", isVerified: true, verificationSource: "Part of Coolray family" },
    { name: "Berkeys", slug: "berkeys", website: "berkeys.com", city: "Dallas", state: "TX", isVerified: true, verificationSource: "Founding brand" },
    { name: "Abacus", slug: "abacus-plumbing", website: "abacusplumbing.com", city: "Houston", state: "TX", isVerified: true, verificationSource: "Founding brand" },
    { name: "Parker & Sons", slug: "parker-sons", website: "parkerandsons.com", city: "Phoenix", state: "AZ", isVerified: true, verificationSource: "Founding brand" },
  ];

  const wrenchPlatform = await prisma.platform.findUnique({ where: { slug: "wrench-group" } });
  const lgpFirm = await prisma.privateEquityFirm.findUnique({ where: { slug: "leonard-green-partners" } });

  console.log("\nCreating/updating Wrench Group brands...");
  if (wrenchPlatform && lgpFirm) {
    for (const brand of wrenchBrands) {
      await prisma.brand.upsert({
        where: { slug: brand.slug },
        update: { ...brand, location: `${brand.city}, ${brand.state}`, platformId: wrenchPlatform.id, privateEquityFirmId: lgpFirm.id },
        create: { ...brand, location: `${brand.city}, ${brand.state}`, platformId: wrenchPlatform.id, privateEquityFirmId: lgpFirm.id },
      });
    }
    console.log(`  ${wrenchBrands.length} Wrench Group brands processed`);
  }

  // Scrape sources
  const silaPlatform = await prisma.platform.findUnique({ where: { slug: "sila-services" } });

  console.log("\nCreating scrape sources...");
  const scrapeSources = [
    { name: "Sila Services Brands Page", url: "https://silaservices.com/brands/", sourceType: "platform_brands_page", scrapeFrequencyHours: 168, selectorConfig: { type: "html", container: ".brand-card" }, platformId: silaPlatform?.id },
    { name: "ACHR News - M&A", url: "https://www.achrnews.com/topics/2669-mergers-acquisitions", sourceType: "news_feed", scrapeFrequencyHours: 24, selectorConfig: { type: "html" } },
    { name: "Contracting Business - M&A", url: "https://www.contractingbusiness.com/mergers-acquisitions", sourceType: "news_feed", scrapeFrequencyHours: 24, selectorConfig: { type: "html" } },
    { name: "BusinessWire - HVAC", url: "https://www.businesswire.com/", sourceType: "press_release", scrapeFrequencyHours: 12, selectorConfig: { type: "search", query: "HVAC acquires" } },
  ];

  for (const source of scrapeSources) {
    await prisma.scrapeSource.upsert({
      where: { id: source.name.toLowerCase().replace(/\s+/g, "-").slice(0, 20) },
      update: source,
      create: { ...source, id: source.name.toLowerCase().replace(/\s+/g, "-").slice(0, 20) },
    });
  }
  console.log(`  ${scrapeSources.length} scrape sources processed`);

  // Final counts
  const counts = await Promise.all([
    prisma.privateEquityFirm.count(),
    prisma.platform.count(),
    prisma.brand.count(),
    prisma.scrapeSource.count(),
  ]);

  console.log("\n=== Final Database Stats ===");
  console.log(`PE Firms: ${counts[0]}`);
  console.log(`Platforms: ${counts[1]}`);
  console.log(`Brands: ${counts[2]}`);
  console.log(`Scrape Sources: ${counts[3]}`);
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
