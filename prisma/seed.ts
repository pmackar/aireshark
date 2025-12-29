import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create PE Firms
  const peFirms = await Promise.all([
    prisma.privateEquityFirm.upsert({
      where: { slug: "apex-service-partners" },
      update: {},
      create: {
        name: "Apex Service Partners",
        slug: "apex-service-partners",
        description:
          "Apex Service Partners is a Tampa-based platform backed by Alpine Investors, focused on partnering with leading local HVAC, plumbing, and electrical brands. Founded in 2019, Apex has grown to over 8,000 employees and has raised $3.36B in funding.",
        website: "https://apexservicepartners.com",
        headquarters: "Tampa, FL",
        foundedYear: 2019,
        assetsUnderManagement: "$3.36B raised",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "alpine-investors" },
      update: {},
      create: {
        name: "Alpine Investors",
        slug: "alpine-investors",
        description:
          "Alpine Investors is a San Francisco-based private equity firm that specializes in software and services businesses. Alpine backs Apex Service Partners and previously built the Wrench Group platform.",
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
        description:
          "Wrench Group is an HVAC and plumbing services platform serving the Atlanta, Dallas, Houston, and Phoenix markets. Originally backed by Alpine Investors, it grew to over $150M in revenues before being sold to Investcorp in 2016, and later acquired by Leonard Green & Partners.",
        website: "https://wrenchgroup.com",
        headquarters: "Atlanta, GA",
        foundedYear: 2015,
        assetsUnderManagement: "$500M+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "redwood-services" },
      update: {},
      create: {
        name: "Redwood Services",
        slug: "redwood-services",
        description:
          "Redwood Services is a PE-backed home services company that has acquired 35+ companies in the past four years. Their acquisitions range from smaller outfits (averaging $1M) to more sizable companies (averaging $20M valuation).",
        website: "https://redwood-services.com",
        headquarters: "Denver, CO",
        foundedYear: 2019,
        assetsUnderManagement: "$1B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "kohlberg-company" },
      update: {},
      create: {
        name: "Kohlberg & Company",
        slug: "kohlberg-company",
        description:
          "Kohlberg & Company is a private equity firm focused on middle-market companies. They have significant investments in the home services sector, including HVAC businesses.",
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
        description:
          "Gridiron Capital is a private equity firm focused on lower middle market companies. They have multiple platform investments in the home services and HVAC sectors.",
        website: "https://gridironcapital.com",
        headquarters: "New Canaan, CT",
        foundedYear: 2006,
        assetsUnderManagement: "$3B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "kinderhook-industries" },
      update: {},
      create: {
        name: "Kinderhook Industries",
        slug: "kinderhook-industries",
        description:
          "Kinderhook Industries is a private equity firm focused on lower middle-market companies in North America, with investments in the services sector including HVAC.",
        website: "https://kinderhook.com",
        headquarters: "New York, NY",
        foundedYear: 2003,
        assetsUnderManagement: "$3B+",
      },
    }),

    prisma.privateEquityFirm.upsert({
      where: { slug: "rotunda-capital" },
      update: {},
      create: {
        name: "Rotunda Capital",
        slug: "rotunda-capital",
        description:
          "Rotunda Capital Partners is a private equity firm focused on lower middle-market businesses, with significant investments in residential home services.",
        website: "https://rotundacapital.com",
        headquarters: "Bethesda, MD",
        foundedYear: 2010,
        assetsUnderManagement: "$700M+",
      },
    }),
  ]);

  console.log(`Created ${peFirms.length} PE firms`);

  // Create sample brands for Apex Service Partners
  const apexFirm = peFirms.find((f) => f.slug === "apex-service-partners");
  if (apexFirm) {
    const brands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "frank-gay-services" },
        update: {},
        create: {
          name: "Frank Gay Services",
          slug: "frank-gay-services",
          description:
            "Frank Gay Services is a leading HVAC, plumbing, and electrical contractor in Central Florida, serving the Orlando area since 1980.",
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
          description:
            "Frontier Service Partners is a Kansas City-based provider of residential HVAC, plumbing, and electrical services. Built from three businesses: Haley Mechanical, Korte Does It All, and AB May.",
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
          description:
            "HomeBreeze is a Y Combinator-backed technology startup launched in 2021 that has coordinated over 1,000 HVAC installations through its platform.",
          website: "https://homebreeze.com",
          location: "San Francisco, CA",
          serviceArea: "National (Platform)",
          acquisitionDate: new Date("2024-11-26"),
          privateEquityFirmId: apexFirm.id,
        },
      }),
    ]);

    console.log(`Created ${brands.length} brands for Apex`);

    // Create acquisitions
    for (const brand of brands) {
      if (brand.acquisitionDate) {
        await prisma.acquisition.upsert({
          where: {
            id: `${apexFirm.id}-${brand.id}`,
          },
          update: {},
          create: {
            date: brand.acquisitionDate,
            amount: "Undisclosed",
            dealType: "acquisition",
            privateEquityFirmId: apexFirm.id,
            brandId: brand.id,
            sourceUrl: "https://apexservicepartners.com",
            sourceTitle: "Apex Service Partners Announcement",
          },
        });
      }
    }
  }

  // Create sample brands for Wrench Group
  const wrenchFirm = peFirms.find((f) => f.slug === "wrench-group");
  if (wrenchFirm) {
    const brands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: "coolray" },
        update: {},
        create: {
          name: "Coolray",
          slug: "coolray",
          description:
            "Coolray is a leading HVAC, plumbing, and electrical service provider in the Atlanta metro area.",
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
          description:
            "Parker & Sons is a leading home services company in Phoenix, Arizona, providing HVAC, plumbing, and electrical services.",
          website: "https://parkerandsons.com",
          location: "Phoenix, AZ",
          serviceArea: "Phoenix Metro",
          acquisitionDate: new Date("2017-06-01"),
          privateEquityFirmId: wrenchFirm.id,
        },
      }),
    ]);

    console.log(`Created ${brands.length} brands for Wrench Group`);
  }

  // Create sample brands for Redwood Services
  const redwoodFirm = peFirms.find((f) => f.slug === "redwood-services");
  if (redwoodFirm) {
    await prisma.brand.upsert({
      where: { slug: "sample-hvac-co" },
      update: {},
      create: {
        name: "Sample HVAC Co",
        slug: "sample-hvac-co",
        description: "A sample HVAC company acquired by Redwood Services.",
        location: "Denver, CO",
        serviceArea: "Colorado",
        acquisitionDate: new Date("2023-06-01"),
        acquisitionPrice: "$15M",
        privateEquityFirmId: redwoodFirm.id,
      },
    });

    console.log("Created brand for Redwood Services");
  }

  // Create sample articles
  await Promise.all([
    prisma.article.upsert({
      where: { url: "https://achrnews.com/pe-hvac-consolidation-2024" },
      update: {},
      create: {
        title: "Private Equity Firms Investing in HVAC Contractor Consolidation",
        url: "https://achrnews.com/pe-hvac-consolidation-2024",
        source: "ACHR News",
        publishedDate: new Date("2024-02-10"),
        summary:
          "Private-equity investors have purchased nearly 800 HVAC, plumbing and electrical companies since 2022. The industry is highly fragmented, making it an attractive consolidation target.",
        privateEquityFirmId: apexFirm?.id,
      },
    }),

    prisma.article.upsert({
      where: { url: "https://wsj.com/pe-hvac-wages-growth" },
      update: {},
      create: {
        title:
          "How Private Equity Transforms Plumbing and HVAC Small Businesses",
        url: "https://wsj.com/pe-hvac-wages-growth",
        source: "Wall Street Journal",
        publishedDate: new Date("2024-11-15"),
        summary:
          "Analysis of how private equity investment in HVAC businesses has boosted wages and driven growth in the sector.",
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
