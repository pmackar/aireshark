import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Private Equity in HVAC
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Track acquisitions, ownership, and industry consolidation in the residential
          heating and air conditioning market.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <StatCard label="PE Firms Tracked" value="8" />
        <StatCard label="Brands Acquired" value="150+" />
        <StatCard label="Total Deal Value" value="$2.5B+" />
        <StatCard label="Active Since" value="2018" />
      </div>

      {/* Top PE Firms */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top PE Firms</h2>
          <Link href="/firms" className="text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PEFirmCard
            name="Apex Service Partners"
            acquisitions={45}
            slug="apex-service-partners"
          />
          <PEFirmCard
            name="Wrench Group (Kohlberg)"
            acquisitions={32}
            slug="wrench-group"
          />
          <PEFirmCard
            name="Redwood Services"
            acquisitions={28}
            slug="redwood-services"
          />
        </div>
      </section>

      {/* Recent Acquisitions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Acquisitions
        </h2>
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
              <AcquisitionRow
                brand="ABC Heating & Air"
                peFirm="Apex Service Partners"
                date="Dec 2024"
                value="Undisclosed"
              />
              <AcquisitionRow
                brand="Comfort Pro HVAC"
                peFirm="Wrench Group"
                date="Nov 2024"
                value="$15M"
              />
              <AcquisitionRow
                brand="Metro Climate Control"
                peFirm="Redwood Services"
                date="Oct 2024"
                value="Undisclosed"
              />
            </tbody>
          </table>
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

function PEFirmCard({
  name,
  acquisitions,
  slug,
}: {
  name: string;
  acquisitions: number;
  slug: string;
}) {
  return (
    <Link href={`/firms/${slug}`}>
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-500">{acquisitions} acquisitions</p>
      </div>
    </Link>
  );
}

function AcquisitionRow({
  brand,
  peFirm,
  date,
  value,
}: {
  brand: string;
  peFirm: string;
  date: string;
  value: string;
}) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {brand}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {peFirm}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{value}</td>
    </tr>
  );
}
