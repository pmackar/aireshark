import Link from "next/link";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

type BrandWithFirm = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  acquisitionDate: Date | null;
  acquisitionPrice: string | null;
  privateEquityFirm: { name: string; slug: string } | null;
};

async function getBrands(): Promise<BrandWithFirm[]> {
  try {
    return await prisma.brand.findMany({
      include: {
        privateEquityFirm: {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HVAC Brands</h1>
        <p className="text-gray-600 mt-2">
          Companies acquired by private equity in the HVAC industry
        </p>
      </div>

      {brands.length > 0 ? (
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
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h2>
          <p className="text-gray-500 mb-4">
            Set up your database and run the seed script to populate brands.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to <code className="bg-gray-100 px-1 rounded">.env</code></p>
            <p>2. Add your Supabase database credentials</p>
            <p>3. Run: <code className="bg-gray-100 px-2 py-1 rounded">npx prisma db push && npm run db:seed</code></p>
          </div>
        </div>
      )}
    </div>
  );
}
