import Link from "next/link";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FirmsPage() {
  const firms = await prisma.privateEquityFirm.findMany({
    include: {
      _count: {
        select: {
          brands: true,
          acquisitions: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Private Equity Firms</h1>
        <p className="text-gray-600 mt-2">
          Track the major private equity players in the HVAC industry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {firms.map((firm) => (
          <Link key={firm.id} href={`/firms/${firm.slug}`}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow h-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {firm.name}
                </h2>
                {firm.foundedYear && (
                  <span className="text-sm text-gray-500">
                    Est. {firm.foundedYear}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {firm.description || "No description available."}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Brands: </span>
                  <span className="font-medium text-gray-900">
                    {firm._count.brands}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Acquisitions: </span>
                  <span className="font-medium text-gray-900">
                    {firm._count.acquisitions}
                  </span>
                </div>
                {firm.assetsUnderManagement && (
                  <div>
                    <span className="text-gray-500">AUM: </span>
                    <span className="font-medium text-gray-900">
                      {firm.assetsUnderManagement}
                    </span>
                  </div>
                )}
              </div>

              {firm.headquarters && (
                <div className="mt-4 text-sm text-gray-500">
                  {firm.headquarters}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {firms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No PE firms found. Run the seed script to populate data.</p>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
            npm run db:seed
          </code>
        </div>
      )}
    </div>
  );
}
