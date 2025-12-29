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
  const platform = await prisma.platform.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!platform) {
    return { title: "Platform Not Found" };
  }

  return {
    title: platform.name,
    description:
      platform.description?.slice(0, 160) ||
      `${platform.name} - HVAC consolidation platform.`,
    openGraph: {
      title: `${platform.name} | aireshark`,
      description:
        platform.description?.slice(0, 160) ||
        `Track ${platform.name}'s acquisitions in the HVAC industry.`,
    },
  };
}

export default async function PlatformDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const platform = await prisma.platform.findUnique({
    where: { slug },
    include: {
      privateEquityFirm: true,
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

  if (!platform) {
    notFound();
  }

  // Group acquisitions by year for the chart
  const acquisitionsByYear = platform.acquisitions.reduce(
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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-12 pb-8 md:pt-16 md:pb-12 mesh-gradient">
        <div className="max-w-[980px] mx-auto px-6">
          <Link
            href="/firms"
            className="text-[13px] text-[#86868b] hover:text-[#14b8a6] mb-6 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Platforms
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold text-[#1d1d1f] tracking-tight leading-tight mb-2">
                {platform.name}
              </h1>
              {platform.privateEquityFirm && (
                <p className="text-[17px] text-[#6e6e73]">
                  Backed by <span className="keyword">{platform.privateEquityFirm.name}</span>
                </p>
              )}
              {platform.headquarters && (
                <p className="text-[15px] text-[#86868b] mt-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {platform.headquarters}
                </p>
              )}
            </div>
            {platform.website && (
              <a
                href={platform.website.startsWith("http") ? platform.website : `https://${platform.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-[15px] py-2.5 px-5"
              >
                Visit Website →
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-[980px] mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass-card p-5 text-center">
            <p className="text-[2rem] font-bold keyword">{platform.brands.length}</p>
            <p className="text-[13px] text-[#86868b]">Brands</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-[2rem] font-bold keyword">{platform.acquisitions.length}</p>
            <p className="text-[13px] text-[#86868b]">Acquisitions</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-[2rem] font-bold keyword">
              {platform.valuationMillions ? `$${(Number(platform.valuationMillions) / 1000).toFixed(1)}B` : "—"}
            </p>
            <p className="text-[13px] text-[#86868b]">Valuation</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-[2rem] font-bold keyword">{platform.foundedYear || "—"}</p>
            <p className="text-[13px] text-[#86868b]">Founded</p>
          </div>
        </div>

        {/* Description */}
        {platform.description && (
          <div className="glass-premium p-8 mb-10">
            <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-3">About</h2>
            <p className="text-[15px] text-[#6e6e73] leading-relaxed">{platform.description}</p>
            {platform.notes && (
              <p className="text-[13px] text-[#86868b] mt-4 italic">{platform.notes}</p>
            )}
          </div>
        )}

        {/* Acquisitions by Year Chart */}
        {years.length > 0 && (
          <div className="glass-premium p-8 mb-10">
            <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-6">
              Acquisitions by Year
            </h2>
            <div className="flex items-end space-x-3 h-48">
              {years.map((year) => {
                const count = acquisitionsByYear[year];
                const height = (count / maxAcquisitions) * 100;
                return (
                  <div key={year} className="flex flex-col items-center flex-1">
                    <span className="text-[15px] font-semibold keyword mb-2">
                      {count}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-[#14b8a6] to-[#2dd4bf] rounded-t-lg"
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                    <span className="text-[12px] text-[#86868b] mt-3">{year}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Brands */}
        <div className="glass-premium p-8 mb-10">
          <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-6">
            Portfolio Brands ({platform.brands.length})
          </h2>
          {platform.brands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platform.brands.map((brand) => (
                <Link key={brand.id} href={`/brands/${brand.slug}`}>
                  <div className="glass-card p-5 h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-[#1d1d1f]">{brand.name}</h3>
                      {brand.isVerified && (
                        <svg className="w-4 h-4 text-[#14b8a6]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {brand.location && (
                      <p className="text-[13px] text-[#86868b]">{brand.location}</p>
                    )}
                    {brand.acquisitionDate && (
                      <p className="text-[12px] text-[#86868b] mt-2">
                        Acquired {new Date(brand.acquisitionDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-[#6e6e73]">No brands recorded yet.</p>
          )}
        </div>

        {/* Recent Articles */}
        {platform.articles.length > 0 && (
          <div className="glass-premium p-8">
            <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-6">
              Related Articles
            </h2>
            <div className="space-y-4">
              {platform.articles.map((article) => (
                <div key={article.id} className="border-b border-black/5 pb-4 last:border-0 last:pb-0">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent text-[15px]"
                  >
                    {article.title}
                  </a>
                  <div className="flex items-center gap-2 text-[13px] text-[#86868b] mt-1">
                    <span>{article.source}</span>
                    {article.publishedDate && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(article.publishedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                  {article.summary && (
                    <p className="text-[14px] text-[#6e6e73] mt-2 line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
