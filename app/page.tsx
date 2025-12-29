import Link from "next/link";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [firmCount, brandCount, acquisitionCount, topFirms, recentAcquisitions] =
      await Promise.all([
        prisma.privateEquityFirm.count(),
        prisma.brand.count(),
        prisma.acquisition.count(),
        prisma.privateEquityFirm.findMany({
          take: 3,
          include: {
            _count: {
              select: { brands: true },
            },
          },
          orderBy: {
            brands: { _count: "desc" },
          },
        }),
        prisma.acquisition.findMany({
          take: 5,
          include: {
            privateEquityFirm: true,
            brand: true,
          },
          orderBy: { date: "desc" },
        }),
      ]);
    return { firmCount, brandCount, acquisitionCount, topFirms, recentAcquisitions };
  } catch {
    // Database not configured - return empty data
    return {
      firmCount: 0,
      brandCount: 0,
      acquisitionCount: 0,
      topFirms: [],
      recentAcquisitions: [],
    };
  }
}

export default async function Home() {
  const { firmCount, brandCount, acquisitionCount, topFirms, recentAcquisitions } =
    await getData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Private Equity in HVAC
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Track acquisitions, ownership, and industry consolidation in the
          residential heating and air conditioning market.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/firms"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore PE Firms
          </Link>
          <Link
            href="/brands"
            className="bg-white text-gray-700 px-6 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            View Brands
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <StatCard label="PE Firms Tracked" value={firmCount.toString()} />
        <StatCard label="Brands Acquired" value={brandCount.toString()} />
        <StatCard label="Acquisitions" value={acquisitionCount.toString()} />
        <StatCard label="Industry" value="HVAC" />
      </div>

      {/* Top PE Firms */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top PE Firms</h2>
          <Link href="/firms" className="text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        {topFirms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topFirms.map((firm) => (
              <Link key={firm.id} href={`/firms/${firm.slug}`}>
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {firm.name}
                  </h3>
                  <p className="text-gray-500">
                    {firm._count.brands} brands owned
                  </p>
                  {firm.headquarters && (
                    <p className="text-sm text-gray-400 mt-2">
                      {firm.headquarters}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No PE firms in database yet.</p>
            <code className="text-sm bg-gray-100 px-3 py-1 rounded">
              npm run db:seed
            </code>
          </div>
        )}
      </section>

      {/* Recent Acquisitions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Acquisitions
        </h2>
        {recentAcquisitions.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PE Firm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAcquisitions.map((acq) => (
                  <tr key={acq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {acq.brand ? (
                        <Link
                          href={`/brands/${acq.brand.slug}`}
                          className="text-blue-600 hover:underline"
                        >
                          {acq.brand.name}
                        </Link>
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        href={`/firms/${acq.privateEquityFirm.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {acq.privateEquityFirm.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(acq.date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {acq.amount || "Undisclosed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No acquisitions recorded yet.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Stay Informed
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          This tracker monitors private equity activity in the HVAC industry,
          automatically scraping news sources and PE firm portfolios for the
          latest acquisition data.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/firms"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse PE Firms
          </Link>
          <Link
            href="/brands"
            className="bg-white text-gray-700 px-6 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            View All Brands
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500">{label}</p>
    </div>
  );
}
