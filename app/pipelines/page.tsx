import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth";
import { getUserPipelines } from "@/lib/pipeline";
import CreatePipelineButton from "./CreatePipelineButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pipelines | aireshark",
  description: "Manage your custom tracking pipelines",
};

export default async function PipelinesPage() {
  const user = await getUserFromSession();

  if (!user) {
    redirect("/login?redirect=/pipelines");
  }

  const pipelines = await getUserPipelines(user.id);

  type Pipeline = Awaited<ReturnType<typeof getUserPipelines>>[number];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-12 mesh-gradient">
        <div className="max-w-[980px] mx-auto px-6">
          <p className="badge badge-accent mb-4">Organization</p>
          <h1 className="hero-headline mb-4">
            Your <span className="accent">Pipelines</span>
          </h1>
          <p className="text-[17px] text-[#6e6e73] max-w-[600px]">
            Create custom lists to track acquisition targets, competitors, and investment opportunities.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-[980px] mx-auto px-6">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[21px] font-semibold text-[#1d1d1f]">
              {pipelines.length} {pipelines.length === 1 ? "Pipeline" : "Pipelines"}
            </h2>
            <CreatePipelineButton />
          </div>

          {pipelines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pipelines.map((pipeline: Pipeline, index: number) => (
                <Link key={pipeline.id} href={`/pipelines/${pipeline.id}`}>
                  <div
                    className="glass-card p-6 h-full opacity-0 animate-fade-in-scale cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
                  >
                    {/* Color accent */}
                    <div
                      className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                      style={{ backgroundColor: (pipeline.color || "#14b8a6") + "20" }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pipeline.color || "#14b8a6" }}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1">
                      {pipeline.name}
                    </h3>

                    {/* Description */}
                    {pipeline.description && (
                      <p className="text-[13px] text-[#6e6e73] line-clamp-2 mb-3">
                        {pipeline.description}
                      </p>
                    )}

                    {/* Item count */}
                    <p className="text-[13px] text-[#86868b]">
                      {pipeline._count.items} {pipeline._count.items === 1 ? "item" : "items"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-premium p-16 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-400/20 to-teal-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
          />
        </svg>
      </div>
      <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-3">No pipelines yet</h2>
      <p className="text-[15px] text-[#6e6e73] mb-6">
        Create your first pipeline to start organizing PE firms, platforms, and brands into custom lists.
      </p>
      <div className="space-y-3">
        <p className="text-[13px] text-[#86868b]">Common pipeline ideas:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="badge bg-purple-100 text-purple-700">Acquisition Targets</span>
          <span className="badge bg-blue-100 text-blue-700">Competitors</span>
          <span className="badge bg-green-100 text-green-700">Investment Opportunities</span>
        </div>
      </div>
    </div>
  );
}
