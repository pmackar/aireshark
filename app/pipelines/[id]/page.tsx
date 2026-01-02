import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUserFromSession } from "@/lib/auth";
import { getPipelineWithItems } from "@/lib/pipeline";
import PipelineItemCard from "./PipelineItemCard";
import PipelineActions from "./PipelineActions";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Pipeline | aireshark",
    description: "View and manage your pipeline items",
  };
}

export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromSession();
  const { id } = await params;

  if (!user) {
    redirect(`/login?redirect=/pipelines/${id}`);
  }

  const pipeline = await getPipelineWithItems(id, user.id);

  if (!pipeline) {
    notFound();
  }

  // Group items by status
  type PipelineItem = (typeof pipeline.items)[number];
  const itemsByStatus = {
    watching: pipeline.items.filter((i: PipelineItem) => i.status === "watching"),
    researching: pipeline.items.filter((i: PipelineItem) => i.status === "researching"),
    contacted: pipeline.items.filter((i: PipelineItem) => i.status === "contacted"),
    negotiating: pipeline.items.filter((i: PipelineItem) => i.status === "negotiating"),
    closed_won: pipeline.items.filter((i: PipelineItem) => i.status === "closed_won"),
    closed_lost: pipeline.items.filter((i: PipelineItem) => i.status === "closed_lost"),
  };

  const statusLabels: Record<string, string> = {
    watching: "Watching",
    researching: "Researching",
    contacted: "Contacted",
    negotiating: "Negotiating",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
  };

  const statusColors: Record<string, string> = {
    watching: "bg-gray-100 text-gray-700",
    researching: "bg-blue-100 text-blue-700",
    contacted: "bg-purple-100 text-purple-700",
    negotiating: "bg-amber-100 text-amber-700",
    closed_won: "bg-green-100 text-green-700",
    closed_lost: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-12 mesh-gradient">
        <div className="max-w-[980px] mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px] text-[#6e6e73] mb-4">
            <Link href="/pipelines" className="hover:text-[#1d1d1f] transition-colors">
              Pipelines
            </Link>
            <span>/</span>
            <span className="text-[#1d1d1f]">{pipeline.name}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Color indicator */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: (pipeline.color || "#14b8a6") + "20" }}
              >
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: pipeline.color || "#14b8a6" }}
                />
              </div>

              <div>
                <h1 className="hero-headline">{pipeline.name}</h1>
                {pipeline.description && (
                  <p className="text-[17px] text-[#6e6e73] mt-1">{pipeline.description}</p>
                )}
              </div>
            </div>

            <PipelineActions pipeline={pipeline} />
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <p className="text-[2rem] font-bold keyword">{pipeline.items.length}</p>
              <p className="text-[13px] text-[#86868b]">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-[2rem] font-bold text-green-600">
                {itemsByStatus.closed_won.length}
              </p>
              <p className="text-[13px] text-[#86868b]">Won</p>
            </div>
            <div className="text-center">
              <p className="text-[2rem] font-bold text-amber-600">
                {itemsByStatus.negotiating.length + itemsByStatus.contacted.length}
              </p>
              <p className="text-[13px] text-[#86868b]">In Progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-[980px] mx-auto px-6">
          {pipeline.items.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(itemsByStatus).map(([status, items]) => {
                if (items.length === 0) return null;

                return (
                  <div key={status}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`badge ${statusColors[status]}`}>
                        {statusLabels[status]}
                      </span>
                      <span className="text-[13px] text-[#86868b]">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item: PipelineItem, index: number) => (
                        <PipelineItemCard
                          key={item.id}
                          item={item}
                          index={index}
                          pipelineId={pipeline.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState pipelineName={pipeline.name} />
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ pipelineName }: { pipelineName: string }) {
  return (
    <div className="glass-premium p-16 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-400/20 to-teal-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-3">
        No items in {pipelineName}
      </h2>
      <p className="text-[15px] text-[#6e6e73] mb-6">
        Add PE firms, platforms, or brands to this pipeline from their detail pages using the Pipeline button.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/firms" className="btn-secondary">
          Browse Platforms
        </Link>
        <Link href="/brands" className="btn-secondary">
          Browse Brands
        </Link>
      </div>
    </div>
  );
}
