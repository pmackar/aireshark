import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const firm = await prisma.privateEquityFirm.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!firm) {
    return { title: "PE Firm Not Found" };
  }

  return {
    title: firm.name,
    description:
      firm.description?.slice(0, 160) ||
      `${firm.name} - Private equity firm investing in HVAC and home services companies.`,
    openGraph: {
      title: `${firm.name} | HVAC PE Tracker`,
      description:
        firm.description?.slice(0, 160) ||
        `Track ${firm.name}'s acquisitions in the HVAC industry.`,
    },
  };
}

export default async function FirmDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const firm = await prisma.privateEquityFirm.findUnique({
    where: { slug },
    include: {
      brands: {
        orderBy: { acquisitionDate: "desc" },
      },
      acquisitions: {
        include: {
          brand: true,
        },
        orderBy: { date: "desc" },
      },
      articles: {
        orderBy: { publishedDate: "desc" },
        take: 10,
      },
    },
  });

  if (!firm) {
    notFound();
  }

  // Group acquisitions by year for the chart
  const acquisitionsByYear = firm.acquisitions.reduce(
    (acc, acq) => {
      const year = new Date(acq.date).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  const years = Object.keys(acquisitionsByYear)
    .map(Number)
    .sort((a, b) => a - b);
  const maxAcquisitions = Math.max(...Object.values(acquisitionsByYear), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/firms"
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          ← Back to PE Firms
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{firm.name}</h1>
            {firm.headquarters && (
              <p className="text-gray-500 mt-1">{firm.headquarters}</p>
            )}
          </div>
          {firm.website && (
            <a
              href={firm.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visit Website →
            </a>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Brands Owned" value={firm.brands.length.toString()} />
        <StatCard
          label="Total Acquisitions"
          value={firm.acquisitions.length.toString()}
        />
        <StatCard label="AUM" value={firm.assetsUnderManagement || "N/A"} />
        <StatCard
          label="Founded"
          value={firm.foundedYear?.toString() || "N/A"}
        />
      </div>

      {/* Description */}
      {firm.description && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-600">{firm.description}</p>
        </div>
      )}

      {/* Acquisitions by Year Chart */}
      {years.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acquisitions by Year
          </h2>
          <div className="flex items-end space-x-2 h-48">
            {years.map((year) => {
              const count = acquisitionsByYear[year];
              const height = (count / maxAcquisitions) * 100;
              return (
                <div key={year} className="flex flex-col items-center flex-1">
                  <span className="text-sm font-medium text-gray-900 mb-1">
                    {count}
                  </span>
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{year}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Owned Brands ({firm.brands.length})
        </h2>
        {firm.brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {firm.brands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`}>
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900">{brand.name}</h3>
                  {brand.location && (
                    <p className="text-sm text-gray-500">{brand.location}</p>
                  )}
                  {brand.acquisitionDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Acquired:{" "}
                      {new Date(brand.acquisitionDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  )}
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No brands recorded yet.</p>
        )}
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Related Articles
        </h2>
        {firm.articles.length > 0 ? (
          <div className="space-y-4">
            {firm.articles.map((article) => (
              <div key={article.id} className="border-b pb-4 last:border-0">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {article.title}
                </a>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <span>{article.source}</span>
                  {article.publishedDate && (
                    <>
                      <span>•</span>
                      <span>
                        {new Date(article.publishedDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </>
                  )}
                </div>
                {article.summary && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {article.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No articles found for this firm.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}
