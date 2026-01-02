import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [platformCount, brandCount, acquisitionCount, topPlatforms] =
      await Promise.all([
        prisma.platform.count({ where: { isActive: true } }),
        prisma.brand.count(),
        prisma.acquisition.count(),
        prisma.platform.findMany({
          where: { isActive: true },
          take: 3,
          include: {
            privateEquityFirm: {
              select: { name: true },
            },
            _count: {
              select: { brands: true },
            },
          },
          orderBy: [
            { valuationMillions: { sort: "desc", nulls: "last" } },
            { brands: { _count: "desc" } },
          ],
        }),
      ]);
    return { platformCount, brandCount, acquisitionCount, topPlatforms };
  } catch {
    return {
      platformCount: 0,
      brandCount: 0,
      acquisitionCount: 0,
      topPlatforms: [],
    };
  }
}

export default async function Home() {
  const { platformCount, brandCount, acquisitionCount, topPlatforms } =
    await getData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-20 md:pt-20 md:pb-28 mesh-gradient">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <div className="mb-10 flex justify-center">
            <div className="animate-float w-full max-w-[280px] md:max-w-[360px] lg:max-w-[420px]">
              <Image
                src="/logo-large.png"
                alt="aireshark"
                width={420}
                height={420}
                className="w-full h-auto object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          <h1 className="hero-headline mb-6">
            <span className="accent">Intelligence</span> for
            <br />
            <span className="accent">Consolidated HVAC</span>.
          </h1>
          <p className="text-[19px] text-[#6e6e73] max-w-[620px] mx-auto leading-relaxed">
            Track <span className="keyword">acquisitions</span>, <span className="keyword">ownership changes</span>, and <span className="keyword">market consolidation</span> across the residential heating and cooling industry.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link href="/firms" className="btn-primary">
              Explore Platforms
            </Link>
            <Link href="/brands" className="btn-secondary">
              View Brands
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="glass-premium p-10 md:p-14">
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#1d1d1f] text-center mb-10 tracking-tight">
              Tracking
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <StatCard value={platformCount.toString()} label="Platforms" />
              <StatCard value={brandCount.toString()} label="Brands" />
              <StatCard value={acquisitionCount.toString()} label="Deals" />
              <StatCard value="HVAC" label="Industry" />
            </div>
          </div>
        </div>
      </section>

      {/* Top Platforms Section */}
      <section className="py-20">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="badge badge-accent mb-4">Market Leaders</p>
            <h2 className="section-headline mb-4">
              Top <span className="keyword-glow">Platforms</span>
            </h2>
            <p className="text-[17px] text-[#6e6e73]">
              The largest PE-backed consolidators in HVAC
            </p>
          </div>

          {topPlatforms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPlatforms.map((platform, index) => (
                <Link key={platform.id} href={`/firms/${platform.slug}`}>
                  <div
                    className="glass-card p-8 h-full opacity-0 animate-fade-in-scale"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="badge badge-accent">
                        {platform._count.brands} brands
                      </span>
                      {platform.valuationMillions && (
                        <span className="text-[13px] font-semibold keyword">
                          ${(Number(platform.valuationMillions) / 1000).toFixed(1)}B
                        </span>
                      )}
                    </div>
                    <h3 className="text-[22px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">
                      {platform.name}
                    </h3>
                    {platform.privateEquityFirm && (
                      <p className="text-[14px] text-[#86868b]">
                        {platform.privateEquityFirm.name}
                      </p>
                    )}
                    {platform.headquarters && (
                      <p className="text-[13px] text-[#86868b] mt-2">
                        {platform.headquarters}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-premium p-14 text-center">
              <p className="text-[#6e6e73] mb-4">No data available yet.</p>
              <code className="text-sm bg-black/5 px-4 py-2 rounded-full text-[#1d1d1f]">
                npm run db:seed
              </code>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/firms" className="btn-secondary">
              View all platforms
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-gradient max-w-[600px] mx-auto" />

      {/* Recent Activity Section */}
      <section className="py-20">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="badge badge-accent mb-4">Live Data</p>
            <h2 className="section-headline mb-4">
              Recent <span className="keyword-glow">Activity</span>
            </h2>
            <p className="text-[17px] text-[#6e6e73]">
              Latest acquisitions and market moves
            </p>
          </div>

          <div className="relative">
            {/* Blurred placeholder table */}
            <div className="data-table overflow-x-auto blur-sm select-none pointer-events-none">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="px-6 py-4 text-left">Brand</th>
                    <th className="px-6 py-4 text-left hidden sm:table-cell">Seller</th>
                    <th className="px-6 py-4 text-left">Platform</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">Date</th>
                    <th className="px-6 py-4 text-left hidden lg:table-cell">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-black/5 last:border-0">
                      <td className="px-6 py-5">
                        <span className="text-[#14b8a6]">Sample Brand {i}</span>
                      </td>
                      <td className="px-6 py-5 text-[#86868b] hidden sm:table-cell">
                        Independent
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[#14b8a6]">Platform Name</span>
                      </td>
                      <td className="px-6 py-5 text-[#86868b] hidden md:table-cell">
                        Jan 2025
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                        <span className="badge badge-accent">Undisclosed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overlay with "Insights coming soon" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass-premium px-8 py-6 text-center">
                <p className="text-[17px] font-semibold text-[#1d1d1f] mb-1">Insights coming soon</p>
                <p className="text-[14px] text-[#86868b]">Real-time acquisition tracking is on the way</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 mesh-gradient">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <div className="glass-premium p-12 md:p-16">
            <h2 className="section-headline mb-6">
              Stay ahead of the <span className="keyword-glow">market</span>.
            </h2>
            <p className="text-[17px] text-[#6e6e73] mb-10 leading-relaxed">
              <span className="keyword">aireshark</span> continuously monitors news sources, press releases, and platform
              portfolios to surface the latest <span className="keyword">acquisition activity</span> in residential HVAC.
            </p>
            <Link href="/firms" className="btn-primary">
              Start Exploring
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  const isText = isNaN(Number(value));
  return (
    <div className="text-center">
      <div className={`text-[2.5rem] md:text-[3rem] font-bold tracking-tight ${isText ? "keyword" : "text-[#1d1d1f]"}`}>
        {value}
      </div>
      <div className="text-[14px] text-[#86868b] font-medium mt-2">{label}</div>
    </div>
  );
}
