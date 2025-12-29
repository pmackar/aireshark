import Link from "next/link";
import prisma from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

type PlatformWithDetails = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  headquarters: string | null;
  foundedYear: number | null;
  estimatedPortfolioSize: string | null;
  valuationMillions: Decimal | null;
  website: string | null;
  privateEquityFirm: {
    name: string;
    slug: string;
  } | null;
  _count: { brands: number };
};

async function getPlatforms(): Promise<PlatformWithDetails[]> {
  try {
    return await prisma.platform.findMany({
      where: {
        isActive: true,
      },
      include: {
        privateEquityFirm: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            brands: true,
          },
        },
      },
      orderBy: [
        { valuationMillions: "desc" },
        { name: "asc" },
      ],
    });
  } catch {
    return [];
  }
}

export default async function PlatformsPage() {
  const platforms = await getPlatforms();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-20 md:pb-16 mesh-gradient">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="badge badge-accent mb-4">Directory</p>
          <h1 className="hero-headline mb-4">
            <span className="accent">Platforms</span>
          </h1>
          <p className="text-[19px] text-[#6e6e73] max-w-[600px] mx-auto">
            PE-backed <span className="keyword">consolidators</span> rolling up the residential HVAC industry
          </p>
        </div>
      </section>

      {/* Platforms Grid */}
      <section className="py-16">
        <div className="max-w-[980px] mx-auto px-6">
          {platforms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platforms.map((platform, index) => (
                <Link key={platform.id} href={`/firms/${platform.slug}`}>
                  <div
                    className="glass-card p-7 h-full opacity-0 animate-fade-in-scale"
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-[19px] font-semibold text-[#1d1d1f] tracking-tight leading-tight pr-2">
                        {platform.name}
                      </h2>
                      {platform.valuationMillions && (
                        <span className="badge badge-accent">
                          ${(Number(platform.valuationMillions) / 1000).toFixed(1)}B
                        </span>
                      )}
                    </div>

                    {platform.privateEquityFirm && (
                      <p className="text-[13px] text-[#86868b] mb-3">
                        Backed by <span className="keyword">{platform.privateEquityFirm.name}</span>
                      </p>
                    )}

                    <p className="text-[15px] text-[#6e6e73] mb-5 line-clamp-2 leading-relaxed">
                      {platform.description || "HVAC consolidation platform."}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[13px]">
                      <div className="bg-black/[0.03] px-3 py-1.5 rounded-full">
                        <span className="text-[#86868b]">Brands </span>
                        <span className="font-semibold keyword">{platform._count.brands}</span>
                      </div>
                      {platform.estimatedPortfolioSize && (
                        <div className="bg-black/[0.03] px-3 py-1.5 rounded-full">
                          <span className="text-[#86868b]">Est. </span>
                          <span className="font-semibold keyword">{platform.estimatedPortfolioSize}</span>
                        </div>
                      )}
                      {platform.foundedYear && (
                        <div className="bg-black/[0.03] px-3 py-1.5 rounded-full">
                          <span className="font-semibold keyword">{platform.foundedYear}</span>
                        </div>
                      )}
                    </div>

                    {platform.headquarters && (
                      <div className="mt-5 pt-4 border-t border-black/5">
                        <p className="text-[13px] text-[#86868b] flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {platform.headquarters}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-premium p-16 text-center max-w-lg mx-auto">
              <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-3">
                No Data Yet
              </h2>
              <p className="text-[15px] text-[#6e6e73] mb-6">
                Set up your database and run the seed script to populate platforms.
              </p>
              <div className="space-y-2 text-[13px] text-[#6e6e73]">
                <p>1. Add your Supabase credentials to <code className="bg-black/5 px-2 py-0.5 rounded">.env</code></p>
                <p>2. Run: <code className="bg-black/5 px-2 py-1 rounded">npx prisma db push && npm run db:seed</code></p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
