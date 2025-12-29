import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with comprehensive HVAC PE data...");

  // Create PE Firms
  const peFirms = await Promise.all([
    prisma.privateEquityFirm.upsert({
      where: { slug: "apex-service-partners" },
      update: {
        description: "The nation's largest residential HVAC consolidator with 107+ acquisitions. Backed by Alpine Investors, Ares Management, and Partners Group. Over 8,000 employees across 45 states.",
        assetsUnderManagement: "$3.36B raised",
      },
      create: {
        name: "Apex Service Partners",
        slug: "apex-service-partners",
        description: "The nation's largest residential HVAC consolidator with 107+ acquisitions. Backed by Alpine Investors, Ares Management, and Partners Group. Over 8,000 employees across 45 states.",
        website: "https://apexservicepartners.com",
        headquarters: "Tampa, FL",
        foundedYear: 2019,
        assetsUnderManagement: "$3.36B raised",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "sila-services" },
      update: {},
      create: {
        name: "Sila Services",
        slug: "sila-services",
        description: "Acquired by Goldman Sachs for $1.7B. Has made 28+ acquisitions since receiving investment from Morgan Stanley Capital Partners in 2021. Operates 30+ companies across Northeast and Mid-Atlantic.",
        website: "https://silaservices.com",
        headquarters: "King of Prussia, PA",
        foundedYear: 2020,
        assetsUnderManagement: "$1.7B",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "redwood-services" },
      update: {
        description: "PE-backed home services platform with 35+ acquisitions in 4 years. Chaired by Adam Hanover, focuses on HVAC, plumbing, and electrical services.",
      },
      create: {
        name: "Redwood Services",
        slug: "redwood-services",
        description: "PE-backed home services platform with 35+ acquisitions in 4 years. Chaired by Adam Hanover, focuses on HVAC, plumbing, and electrical services.",
        website: "https://redwood-services.com",
        headquarters: "Denver, CO",
        foundedYear: 2019,
        assetsUnderManagement: "$1B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "seer-group" },
      update: {},
      create: {
        name: "The SEER Group",
        slug: "seer-group",
        description: "Washington-based PE firm with 40+ companies under management in HVAC, mechanical, and plumbing service categories.",
        website: "https://theseergroup.com",
        headquarters: "Seattle, WA",
        foundedYear: 2018,
        assetsUnderManagement: "$500M+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "heartland-home-services" },
      update: {},
      create: {
        name: "Heartland Home Services",
        slug: "heartland-home-services",
        description: "Grand Rapids-based platform with 40+ professional services companies including major Michigan HVAC brands.",
        website: "https://heartlandhomeservices.com",
        headquarters: "Grand Rapids, MI",
        foundedYear: 2020,
        assetsUnderManagement: "$400M+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "exigent-group" },
      update: {},
      create: {
        name: "The Exigent Group",
        slug: "exigent-group",
        description: "Portfolio company of Detroit-based Huron Capital. Focuses on commercial and industrial HVAC and mechanical services with 7+ acquisitions.",
        website: "https://exigentgroup.com",
        headquarters: "Detroit, MI",
        foundedYear: 2022,
        assetsUnderManagement: "$200M+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "orion-group" },
      update: {},
      create: {
        name: "Orion Group",
        slug: "orion-group",
        description: "Commercial facility services platform formed by Alpine Investors in 2020. 35+ acquisitions focused on HVAC/R, plumbing and DTO services.",
        website: "https://oriongrouphq.com",
        headquarters: "Houston, TX",
        foundedYear: 2020,
        assetsUnderManagement: "$800M+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "alpine-investors" },
      update: {},
      create: {
        name: "Alpine Investors",
        slug: "alpine-investors",
        description: "San Francisco-based PE firm specializing in software and services. Created Apex Service Partners and Orion Group platforms. Completed $3.4B single-asset continuation transaction for Apex.",
        website: "https://alpineinvestors.com",
        headquarters: "San Francisco, CA",
        foundedYear: 2001,
        assetsUnderManagement: "$15B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "wrench-group" },
      update: {},
      create: {
        name: "Wrench Group",
        slug: "wrench-group",
        description: "HVAC and plumbing platform serving Atlanta, Dallas, Houston, and Phoenix. Originally Alpine-backed, later acquired by Leonard Green & Partners.",
        website: "https://wrenchgroup.com",
        headquarters: "Atlanta, GA",
        foundedYear: 2015,
        assetsUnderManagement: "$500M+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "audax-private-equity" },
      update: {},
      create: {
        name: "Audax Private Equity",
        slug: "audax-private-equity",
        description: "Boston-based PE firm with notable HVAC investments including Reedy Industries and Ramco Refrigeration.",
        website: "https://audaxprivateequity.com",
        headquarters: "Boston, MA",
        foundedYear: 1999,
        assetsUnderManagement: "$30B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "riverside-company" },
      update: {},
      create: {
        name: "The Riverside Company",
        slug: "riverside-company",
        description: "Global PE firm with 140+ portfolio companies. Investments include Radiant Plumbing & Air Conditioning and other home services brands.",
        website: "https://riversidecompany.com",
        headquarters: "New York, NY",
        foundedYear: 1988,
        assetsUnderManagement: "$14B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "huron-capital" },
      update: {},
      create: {
        name: "Huron Capital",
        slug: "huron-capital",
        description: "Detroit-based PE firm backing The Exigent Group platform for commercial HVAC services.",
        website: "https://huroncapital.com",
        headquarters: "Detroit, MI",
        foundedYear: 1999,
        assetsUnderManagement: "$2B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "any-hour-group" },
      update: {},
      create: {
        name: "Any Hour Group",
        slug: "any-hour-group",
        description: "Utah-based home services platform acquiring HVAC and plumbing companies across the Intermountain West.",
        website: "https://anyhourservices.com",
        headquarters: "Salt Lake City, UT",
        foundedYear: 2019,
        assetsUnderManagement: "$300M+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "bestige" },
      update: {},
      create: {
        name: "Bestige",
        slug: "bestige",
        description: "Park City, Utah-based platform operating Intermountain Home Services with 12+ regional HVAC and plumbing companies.",
        website: "https://bestige.com",
        headquarters: "Park City, UT",
        foundedYear: 2020,
        assetsUnderManagement: "$250M+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "kohlberg-company" },
      update: {},
      create: {
        name: "Kohlberg & Company",
        slug: "kohlberg-company",
        description: "Middle-market PE firm with significant home services investments.",
        website: "https://kohlberg.com",
        headquarters: "Mount Kisco, NY",
        foundedYear: 1987,
        assetsUnderManagement: "$10B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "gridiron-capital" },
      update: {},
      create: {
        name: "Gridiron Capital",
        slug: "gridiron-capital",
        description: "Lower middle market PE firm with multiple HVAC platform investments.",
        website: "https://gridironcapital.com",
        headquarters: "New Canaan, CT",
        foundedYear: 2006,
        assetsUnderManagement: "$3B+",
      },
    }),
  ]);

  console.log(`Created/updated ${peFirms.length} PE firms`);

  // Helper to find firms
  const findFirm = (slug: string) => peFirms.find((f) => f.slug === slug);

  // ========== APEX SERVICE PARTNERS BRANDS ==========
  const apexFirm = findFirm("apex-service-partners");
  if (apexFirm) {
    const apexBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "frank-gay-services" },
        update: {},
        create: {
          name: "Frank Gay Services",
          slug: "frank-gay-services",
          description: "Leading HVAC, plumbing, and electrical contractor in Central Florida since 1980.",
          website: "https://frankgayservices.com",
          location: "Orlando, FL",
          serviceArea: "Central Florida",
          acquisitionDate: new Date("2019-07-01"),
          privateEquityFirmId: apexFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "frontier-service-partners" },
        update: {},
        create: {
          name: "Frontier Service Partners",
          slug: "frontier-service-partners",
          description: "Kansas City-based platform built from Haley Mechanical, Korte Does It All, and AB May.",
          website: "https://frontierservicepartners.com",
          location: "Kansas City, MO",
          serviceArea: "Midwest",
          acquisitionDate: new Date("2024-01-24"),
          privateEquityFirmId: apexFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "homebreeze" },
        update: {},
        create: {
          name: "HomeBreeze",
          slug: "homebreeze",
          description: "Y Combinator-backed tech startup for HVAC installations. Raised $3M in 2021.",
          website: "https://homebreeze.com",
          location: "San Francisco, CA",
          serviceArea: "California",
          acquisitionDate: new Date("2024-11-26"),
          privateEquityFirmId: apexFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "morris-jenkins" },
        update: {},
        create: {
          name: "Morris-Jenkins",
          slug: "morris-jenkins",
          description: "Premier HVAC and plumbing service provider in Charlotte, NC area.",
          website: "https://morrisjenkins.com",
          location: "Charlotte, NC",
          serviceArea: "Charlotte Metro",
          acquisitionDate: new Date("2020-03-01"),
          privateEquityFirmId: apexFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "horizon-services" },
        update: {},
        create: {
          name: "Horizon Services",
          slug: "horizon-services",
          description: "Full-service HVAC, plumbing, and electrical in Delaware Valley region.",
          website: "https://horizonservices.com",
          location: "Wilmington, DE",
          serviceArea: "Delaware Valley",
          acquisitionDate: new Date("2021-06-01"),
          privateEquityFirmId: apexFirm.id,
        },
      }),
    ]);
    console.log(`Created ${apexBrands.length} brands for Apex`);
  }

  // ========== SILA SERVICES BRANDS ==========
  const silaFirm = findFirm("sila-services");
  if (silaFirm) {
    const silaBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "sila-heating-air" },
        update: {},
        create: {
          name: "Sila Heating & Air Conditioning",
          slug: "sila-heating-air",
          description: "Flagship residential HVAC brand in the Northeast.",
          website: "https://silaservices.com",
          location: "King of Prussia, PA",
          serviceArea: "Northeast",
          acquisitionDate: new Date("2021-05-01"),
          privateEquityFirmId: silaFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "t-f-obriens" },
        update: {},
        create: {
          name: "T.F. O'Brien's",
          slug: "t-f-obriens",
          description: "Long Island-based HVAC services provider.",
          website: "https://tfobriens.com",
          location: "Long Island, NY",
          serviceArea: "Long Island",
          acquisitionDate: new Date("2022-02-01"),
          privateEquityFirmId: silaFirm.id,
        },
      }),
    ]);
    console.log(`Created ${silaBrands.length} brands for Sila`);
  }

  // ========== HEARTLAND HOME SERVICES BRANDS ==========
  const heartlandFirm = findFirm("heartland-home-services");
  if (heartlandFirm) {
    const heartlandBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "flame-heating-cooling" },
        update: {},
        create: {
          name: "Flame Heating, Cooling and Plumbing",
          slug: "flame-heating-cooling",
          description: "Michigan-based full-service HVAC and plumbing company.",
          website: "https://flameheating.com",
          location: "Warren, MI",
          serviceArea: "Metro Detroit",
          acquisitionDate: new Date("2022-04-01"),
          privateEquityFirmId: heartlandFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "randazzo-heating-cooling" },
        update: {},
        create: {
          name: "Randazzo Heating & Cooling",
          slug: "randazzo-heating-cooling",
          description: "Southeast Michigan HVAC services provider.",
          website: "https://randazzohvac.com",
          location: "Macomb, MI",
          serviceArea: "Southeast Michigan",
          acquisitionDate: new Date("2021-08-01"),
          privateEquityFirmId: heartlandFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "vredevoogd-heating-cooling" },
        update: {},
        create: {
          name: "Vredevoogd Heating & Cooling",
          slug: "vredevoogd-heating-cooling",
          description: "West Michigan HVAC and plumbing services.",
          website: "https://vredevoogd.com",
          location: "Grand Rapids, MI",
          serviceArea: "West Michigan",
          acquisitionDate: new Date("2021-03-01"),
          privateEquityFirmId: heartlandFirm.id,
        },
      }),
    ]);
    console.log(`Created ${heartlandBrands.length} brands for Heartland`);
  }

  // ========== SEER GROUP BRANDS ==========
  const seerFirm = findFirm("seer-group");
  if (seerFirm) {
    const seerBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "western-heating-air" },
        update: {},
        create: {
          name: "Western Heating & Air",
          slug: "western-heating-air",
          description: "Boise-based HVAC company with 54 years of local ownership before PE acquisition.",
          website: "https://westernheatingair.com",
          location: "Boise, ID",
          serviceArea: "Treasure Valley",
          acquisitionDate: new Date("2021-06-01"),
          privateEquityFirmId: seerFirm.id,
        },
      }),
    ]);
    console.log(`Created ${seerBrands.length} brands for SEER Group`);
  }

  // ========== EXIGENT GROUP BRANDS ==========
  const exigentFirm = findFirm("exigent-group");
  if (exigentFirm) {
    const exigentBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "premier-mechanical-services" },
        update: {},
        create: {
          name: "Premier Mechanical Services",
          slug: "premier-mechanical-services",
          description: "Commercial and industrial HVAC services in Lima, Ohio.",
          website: "https://premiermechanical.com",
          location: "Lima, OH",
          serviceArea: "Northwest Ohio",
          acquisitionDate: new Date("2025-01-15"),
          privateEquityFirmId: exigentFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "smith-boughan-mechanical" },
        update: {},
        create: {
          name: "Smith-Boughan Mechanical",
          slug: "smith-boughan-mechanical",
          description: "Ohio-based commercial HVAC and mechanical services.",
          website: "https://smithboughan.com",
          location: "Fremont, OH",
          serviceArea: "Ohio",
          acquisitionDate: new Date("2024-08-01"),
          privateEquityFirmId: exigentFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "electrical-automation-systems" },
        update: {},
        create: {
          name: "Electrical Automation Systems Inc",
          slug: "electrical-automation-systems",
          description: "Maryland-based electrical and automation services.",
          location: "Baltimore, MD",
          serviceArea: "Mid-Atlantic",
          acquisitionDate: new Date("2024-08-01"),
          privateEquityFirmId: exigentFirm.id,
        },
      }),
    ]);
    console.log(`Created ${exigentBrands.length} brands for Exigent`);
  }

  // ========== WRENCH GROUP BRANDS ==========
  const wrenchFirm = findFirm("wrench-group");
  if (wrenchFirm) {
    const wrenchBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "coolray" },
        update: {},
        create: {
          name: "Coolray",
          slug: "coolray",
          description: "Leading HVAC, plumbing, and electrical in Metro Atlanta.",
          website: "https://coolray.com",
          location: "Atlanta, GA",
          serviceArea: "Metro Atlanta",
          acquisitionDate: new Date("2016-01-01"),
          privateEquityFirmId: wrenchFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "parker-sons" },
        update: {},
        create: {
          name: "Parker & Sons",
          slug: "parker-sons",
          description: "Phoenix's leading home services company.",
          website: "https://parkerandsons.com",
          location: "Phoenix, AZ",
          serviceArea: "Phoenix Metro",
          acquisitionDate: new Date("2017-06-01"),
          privateEquityFirmId: wrenchFirm.id,
        },
      }),
    ]);
    console.log(`Created ${wrenchBrands.length} brands for Wrench Group`);
  }

  // ========== ANY HOUR GROUP BRANDS ==========
  const anyHourFirm = findFirm("any-hour-group");
  if (anyHourFirm) {
    const anyHourBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "perfect-plumbing-air" },
        update: {},
        create: {
          name: "Perfect Plumbing & Air",
          slug: "perfect-plumbing-air",
          description: "Boise-based plumbing and HVAC services.",
          location: "Boise, ID",
          serviceArea: "Treasure Valley",
          acquisitionDate: new Date("2022-05-01"),
          privateEquityFirmId: anyHourFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "magic-electric" },
        update: {},
        create: {
          name: "Magic Electric",
          slug: "magic-electric",
          description: "Jerome, Idaho electrical services company.",
          location: "Jerome, ID",
          serviceArea: "Southern Idaho",
          acquisitionDate: new Date("2022-05-01"),
          privateEquityFirmId: anyHourFirm.id,
        },
      }),
    ]);
    console.log(`Created ${anyHourBrands.length} brands for Any Hour`);
  }

  // ========== BESTIGE BRANDS ==========
  const bestigeFirm = findFirm("bestige");
  if (bestigeFirm) {
    const bestigeBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "diamond-heating-cooling" },
        update: {},
        create: {
          name: "Diamond Heating and Cooling",
          slug: "diamond-heating-cooling",
          description: "Boise-based HVAC services now part of Intermountain Home Services.",
          location: "Boise, ID",
          serviceArea: "Treasure Valley",
          acquisitionDate: new Date("2023-03-01"),
          privateEquityFirmId: bestigeFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "master-plumbing" },
        update: {},
        create: {
          name: "Master Plumbing",
          slug: "master-plumbing",
          description: "Idaho plumbing services company.",
          location: "Boise, ID",
          serviceArea: "Idaho",
          acquisitionDate: new Date("2023-03-01"),
          privateEquityFirmId: bestigeFirm.id,
        },
      }),
    ]);
    console.log(`Created ${bestigeBrands.length} brands for Bestige`);
  }

  // ========== AUDAX BRANDS ==========
  const audaxFirm = findFirm("audax-private-equity");
  if (audaxFirm) {
    const audaxBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "reedy-industries" },
        update: {},
        create: {
          name: "Reedy Industries",
          slug: "reedy-industries",
          description: "Commercial HVAC services platform.",
          website: "https://reedyindustries.com",
          location: "Chicago, IL",
          serviceArea: "Midwest",
          acquisitionDate: new Date("2020-09-01"),
          privateEquityFirmId: audaxFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "ramco-refrigeration" },
        update: {},
        create: {
          name: "Ramco Refrigeration",
          slug: "ramco-refrigeration",
          description: "Commercial refrigeration and HVAC services.",
          location: "Various",
          serviceArea: "National",
          acquisitionDate: new Date("2021-04-01"),
          privateEquityFirmId: audaxFirm.id,
        },
      }),
    ]);
    console.log(`Created ${audaxBrands.length} brands for Audax`);
  }

  // ========== RIVERSIDE BRANDS ==========
  const riversideFirm = findFirm("riverside-company");
  if (riversideFirm) {
    const riversideBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "radiant-plumbing-air" },
        update: {},
        create: {
          name: "Radiant Plumbing & Air Conditioning",
          slug: "radiant-plumbing-air",
          description: "Austin, Texas plumbing and HVAC services.",
          website: "https://radiantplumbing.com",
          location: "Austin, TX",
          serviceArea: "Central Texas",
          acquisitionDate: new Date("2022-11-01"),
          privateEquityFirmId: riversideFirm.id,
        },
      }),
    ]);
    console.log(`Created ${riversideBrands.length} brands for Riverside`);
  }

  // ========== REDWOOD SERVICES BRANDS ==========
  const redwoodFirm = findFirm("redwood-services");
  if (redwoodFirm) {
    const redwoodBrands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "medina-heating-cooling" },
        update: {},
        create: {
          name: "Medina Heating and Cooling",
          slug: "medina-heating-cooling",
          description: "Northeast Ohio HVAC services.",
          location: "Medina, OH",
          serviceArea: "Northeast Ohio",
          acquisitionDate: new Date("2023-02-01"),
          privateEquityFirmId: redwoodFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "falls-heating-cooling" },
        update: {},
        create: {
          name: "Falls Heating and Cooling",
          slug: "falls-heating-cooling",
          description: "Ohio HVAC services provider.",
          location: "Cuyahoga Falls, OH",
          serviceArea: "Northeast Ohio",
          acquisitionDate: new Date("2023-05-01"),
          privateEquityFirmId: redwoodFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "wf-hann-sons" },
        update: {},
        create: {
          name: "W.F. Hann & Sons",
          slug: "wf-hann-sons",
          description: "Cleveland-area HVAC and plumbing since 1907.",
          location: "Cleveland, OH",
          serviceArea: "Greater Cleveland",
          acquisitionDate: new Date("2022-09-01"),
          privateEquityFirmId: redwoodFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "pk-wadsworth" },
        update: {},
        create: {
          name: "P.K. Wadsworth",
          slug: "pk-wadsworth",
          description: "Northeast Ohio heating and cooling services.",
          location: "Cleveland, OH",
          serviceArea: "Northeast Ohio",
          acquisitionDate: new Date("2022-06-01"),
          privateEquityFirmId: redwoodFirm.id,
        },
      }),
      prisma.brand.upsert({
        where: { slug: "arco-comfort-air" },
        update: {},
        create: {
          name: "Arco Comfort Air",
          slug: "arco-comfort-air",
          description: "Ohio HVAC services provider.",
          location: "Solon, OH",
          serviceArea: "Northeast Ohio",
          acquisitionDate: new Date("2023-01-01"),
          privateEquityFirmId: redwoodFirm.id,
        },
      }),
    ]);
    console.log(`Created ${redwoodBrands.length} brands for Redwood`);
  }

  // Create sample articles
  await Promise.all([
    prisma.article.upsert({
      where: { url: "https://capstonepartners.com/hvac-ma-2025" },
      update: {},
      create: {
        title: "HVAC Services M&A Update - Mid 2025",
        url: "https://capstonepartners.com/hvac-ma-2025",
        source: "Capstone Partners",
        publishedDate: new Date("2025-07-01"),
        summary: "Global HVAC Services M&A volume reached 77 deals YTD with PE add-ons rising 88% year-over-year.",
      },
    }),
    prisma.article.upsert({
      where: { url: "https://spglobal.com/hvac-pe-megadeals-2025" },
      update: {},
      create: {
        title: "Record Private Equity Megadeal Value in HVAC",
        url: "https://spglobal.com/hvac-pe-megadeals-2025",
        source: "S&P Global",
        publishedDate: new Date("2025-10-01"),
        summary: "Platform plays in HVAC industry drive record private equity megadeal value in 2025.",
      },
    }),
    prisma.article.upsert({
      where: { url: "https://wsj.com/pe-hvac-transformation" },
      update: {},
      create: {
        title: "How Private Equity Transforms HVAC Small Businesses",
        url: "https://wsj.com/pe-hvac-transformation",
        source: "Wall Street Journal",
        publishedDate: new Date("2024-11-15"),
        summary: "PE investment in HVAC businesses has boosted wages and driven growth across the sector.",
      },
    }),
    prisma.article.upsert({
      where: { url: "https://alpineinvestors.com/apex-continuation" },
      update: {},
      create: {
        title: "Alpine Closes $3.4B Continuation Transaction for Apex",
        url: "https://alpineinvestors.com/apex-continuation",
        source: "Alpine Investors",
        publishedDate: new Date("2024-06-01"),
        summary: "Alpine Investors completes $3.4B single-asset continuation transaction for Apex Service Partners.",
        privateEquityFirmId: apexFirm?.id,
      },
    }),
    prisma.article.upsert({
      where: { url: "https://goldmansachs.com/sila-acquisition" },
      update: {},
      create: {
        title: "Goldman Sachs Acquires Sila Services for $1.7B",
        url: "https://goldmansachs.com/sila-acquisition",
        source: "Goldman Sachs",
        publishedDate: new Date("2024-03-01"),
        summary: "Goldman Sachs completes $1.7B acquisition of Sila Services, a leading home services platform.",
        privateEquityFirmId: silaFirm?.id,
      },
    }),
  ]);

  console.log("Created sample articles");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
