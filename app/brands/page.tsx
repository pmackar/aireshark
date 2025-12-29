import Link from "next/link";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

type BrandWithPlatform = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  acquisitionDate: Date | null;
  acquisitionPrice: string | null;
  isVerified: boolean;
  platform: { name: string; slug: string } | null;
};

async function getBrands(): Promise<BrandWithPlatform[]> {
  try {
    return await prisma.brand.findMany({
      include: {
        platform: {
          select: { name: true, slug: true },
        },
      },
      orderBy: {
        acquisitionDate: "desc",
      },
    });
  } catch {
    return [];
  }
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-20 md:pb-16 mesh-gradient">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="badge badge-accent mb-4">Portfolio</p>
          <h1 className="hero-headline mb-4">
            <span className="accent">Brands</span>
          </h1>
          <p className="text-[19px] text-[#6e6e73] max-w-[600px] mx-auto">
            HVAC companies <span className="keyword">acquired</span> by PE-backed platforms
          </p>
        </div>
      </section>

      {/* Brands Table */}
      <section className="py-16">
        <div className="max-w-[980px] mx-auto px-6">
          {brands.length > 0 ? (
            <div className="data-table overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="px-6 py-4 text-left">Brand</th>
                    <th className="px-6 py-4 text-left">Platform</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">Location</th>
                    <th className="px-6 py-4 text-left hidden sm:table-cell">Acquired</th>
                    <th className="px-6 py-4 text-left hidden lg:table-cell">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand, index) => (
                    <tr
                      key={brand.id}
                      className="border-b border-black/5 last:border-0 opacity-0 animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s`, animationFillMode: "forwards" }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/brands/${brand.slug}`}
                            className="link-accent font-medium"
                          >
                            {brand.name}
                          </Link>
                          {brand.isVerified && (
                            <svg className="w-4 h-4 text-[#14b8a6]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {brand.platform ? (
                          <Link
                            href={`/firms/${brand.platform.slug}`}
                            className="link-accent"
                          >
                            {brand.platform.name}
                          </Link>
                        ) : (
                          <span className="text-[#86868b]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-[#86868b] hidden md:table-cell">
                        {brand.location || "—"}
                      </td>
                      <td className="px-6 py-5 text-[#86868b] hidden sm:table-cell">
                        {brand.acquisitionDate
                          ? new Date(brand.acquisitionDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                        <span className="badge badge-accent">
                          {brand.acquisitionPrice || "Undisclosed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass-premium p-16 text-center max-w-lg mx-auto">
              <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-3">
                No Data Yet
              </h2>
              <p className="text-[15px] text-[#6e6e73] mb-6">
                Set up your database and run the seed script to populate brands.
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
