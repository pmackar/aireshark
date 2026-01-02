import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";
import GatedContent from "@/components/auth/GatedContent";
import AddToWatchlistButton from "@/components/watchlist/AddToWatchlistButton";
import AddToPipelineButton from "@/components/pipeline/AddToPipelineButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: { name: true, description: true, location: true },
  });

  if (!brand) {
    return { title: "Brand Not Found" };
  }

  const description =
    brand.description?.slice(0, 160) ||
    `${brand.name}${brand.location ? ` in ${brand.location}` : ""} - HVAC company acquired by private equity.`;

  return {
    title: brand.name,
    description,
    openGraph: {
      title: `${brand.name} | HVAC PE Tracker`,
      description,
    },
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getUserFromSession();
  const isAuthenticated = !!user;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      privateEquityFirm: true,
      articles: {
        orderBy: { publishedDate: "desc" },
        take: 5,
      },
      acquisitions: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!brand) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/brands"
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Brands
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
            {brand.location && (
              <p className="text-gray-500 mt-1">{brand.location}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <AddToWatchlistButton entityType="brand" entityId={brand.id} />
                <AddToPipelineButton entityType="brand" entityId={brand.id} />
              </>
            )}
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Visit Website →
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {brand.description && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-600">{brand.description}</p>
            </div>
          )}

          {/* Acquisition Details - Gated */}
          <GatedContent isAuthenticated={isAuthenticated} message="Sign up to view acquisition details and deal values">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Acquisition Details
              </h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Acquired By</dt>
                  <dd className="text-gray-900 font-medium">
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
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Acquisition Date</dt>
                  <dd className="text-gray-900 font-medium">
                    {brand.acquisitionDate
                      ? new Date(brand.acquisitionDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Deal Value</dt>
                  <dd className="text-gray-900 font-medium">
                    {brand.acquisitionPrice || "Undisclosed"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Service Area</dt>
                  <dd className="text-gray-900 font-medium">
                    {brand.serviceArea || "Local/Regional"}
                  </dd>
                </div>
              </dl>
            </div>
          </GatedContent>

          {/* Related Articles - Gated */}
          {brand.articles.length > 0 && (
            <GatedContent isAuthenticated={isAuthenticated} message="Sign up to access related news and articles">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Related Articles
                </h2>
                <div className="space-y-4">
                  {brand.articles.map((article) => (
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
                    </div>
                  ))}
                </div>
              </div>
            </GatedContent>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Info
            </h3>
            <dl className="space-y-3">
              {brand.location && (
                <div>
                  <dt className="text-sm text-gray-500">Location</dt>
                  <dd className="text-gray-900">{brand.location}</dd>
                </div>
              )}
              {brand.serviceArea && (
                <div>
                  <dt className="text-sm text-gray-500">Service Area</dt>
                  <dd className="text-gray-900">{brand.serviceArea}</dd>
                </div>
              )}
              {brand.website && (
                <div>
                  <dt className="text-sm text-gray-500">Website</dt>
                  <dd>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {brand.website.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Parent Company Card */}
          {brand.privateEquityFirm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Parent Company
              </h3>
              <Link href={`/firms/${brand.privateEquityFirm.slug}`}>
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">
                    {brand.privateEquityFirm.name}
                  </p>
                  {brand.privateEquityFirm.headquarters && (
                    <p className="text-sm text-gray-500">
                      {brand.privateEquityFirm.headquarters}
                    </p>
                  )}
                  <p className="text-sm text-blue-600 mt-2">
                    View PE Profile →
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
