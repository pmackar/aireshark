import Link from "next/link";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      privateEquityFirm: true,
    },
    orderBy: {
      acquisitionDate: "desc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HVAC Brands</h1>
        <p className="text-gray-600 mt-2">
          Companies acquired by private equity in the HVAC industry
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PE Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acquired
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deal Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {brand.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {brand.privateEquityFirm ? (
                    <Link
                      href={`/firms/${brand.privateEquityFirm.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {brand.privateEquityFirm.name}
                    </Link>
                  ) : (
                    "Unknown"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {brand.location || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {brand.acquisitionPrice || "Undisclosed"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {brands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No brands found. Run the seed script to populate data.
            </p>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
              npm run db:seed
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
