"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PIPELINE_STATUSES, PRIORITIES } from "@/lib/pipeline";

interface PipelineItemCardProps {
  item: {
    id: string;
    status: string;
    priority: string | null;
    notes: string | null;
    addedAt: Date;
    privateEquityFirm: { name: string; slug: string } | null;
    platform: { name: string; slug: string } | null;
    brand: { name: string; slug: string } | null;
  };
  index: number;
  pipelineId: string;
}

const statusLabels: Record<string, string> = {
  watching: "Watching",
  researching: "Researching",
  contacted: "Contacted",
  negotiating: "Negotiating",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-amber-100 text-amber-600",
  critical: "bg-red-100 text-red-600",
};

function getEntityInfo(item: PipelineItemCardProps["item"]) {
  if (item.privateEquityFirm) {
    return { type: "firm", name: item.privateEquityFirm.name, slug: item.privateEquityFirm.slug, href: `/firms/${item.privateEquityFirm.slug}` };
  }
  if (item.platform) {
    return { type: "platform", name: item.platform.name, slug: item.platform.slug, href: `/firms/${item.platform.slug}` };
  }
  if (item.brand) {
    return { type: "brand", name: item.brand.name, slug: item.brand.slug, href: `/brands/${item.brand.slug}` };
  }
  return null;
}

export default function PipelineItemCard({ item, index, pipelineId }: PipelineItemCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const entity = getEntityInfo(item);
  if (!entity) return null;

  async function updateItem(updates: { status?: string; priority?: string | null }) {
    setIsUpdating(true);
    try {
      await fetch(`/api/pipelines/${pipelineId}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setIsUpdating(false);
      setShowMenu(false);
    }
  }

  async function removeItem() {
    setIsUpdating(true);
    try {
      await fetch(`/api/pipelines/${pipelineId}/items/${item.id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div
      className="glass-card p-5 opacity-0 animate-fade-in-scale relative group"
      style={{ animationDelay: `${index * 0.03}s`, animationFillMode: "forwards" }}
    >
      {/* Actions Menu */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-black/5 py-2 z-10">
            <div className="px-3 py-1.5 text-[11px] font-medium text-[#86868b] uppercase tracking-wide">
              Status
            </div>
            {PIPELINE_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => updateItem({ status })}
                disabled={isUpdating}
                className={`w-full px-3 py-1.5 text-left text-[13px] hover:bg-black/5 ${
                  item.status === status ? "text-teal-600 font-medium" : "text-[#1d1d1f]"
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}

            <div className="border-t border-black/5 my-2" />

            <div className="px-3 py-1.5 text-[11px] font-medium text-[#86868b] uppercase tracking-wide">
              Priority
            </div>
            <button
              onClick={() => updateItem({ priority: null })}
              disabled={isUpdating}
              className={`w-full px-3 py-1.5 text-left text-[13px] hover:bg-black/5 ${
                !item.priority ? "text-teal-600 font-medium" : "text-[#1d1d1f]"
              }`}
            >
              None
            </button>
            {PRIORITIES.map((priority) => (
              <button
                key={priority}
                onClick={() => updateItem({ priority })}
                disabled={isUpdating}
                className={`w-full px-3 py-1.5 text-left text-[13px] hover:bg-black/5 ${
                  item.priority === priority ? "text-teal-600 font-medium" : "text-[#1d1d1f]"
                }`}
              >
                {priorityLabels[priority]}
              </button>
            ))}

            <div className="border-t border-black/5 my-2" />

            <button
              onClick={removeItem}
              disabled={isUpdating}
              className="w-full px-3 py-1.5 text-left text-[13px] text-red-600 hover:bg-red-50"
            >
              Remove from Pipeline
            </button>
          </div>
        )}
      </div>

      {/* Entity Type Badge */}
      <span className={`badge text-[11px] mb-3 ${
        entity.type === "firm" ? "bg-purple-100 text-purple-700" :
        entity.type === "platform" ? "bg-blue-100 text-blue-700" :
        "bg-green-100 text-green-700"
      }`}>
        {entity.type === "firm" ? "PE Firm" : entity.type === "platform" ? "Platform" : "Brand"}
      </span>

      {/* Entity Name */}
      <Link href={entity.href}>
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] hover:text-teal-600 transition-colors mb-2">
          {entity.name}
        </h3>
      </Link>

      {/* Priority Badge */}
      {item.priority && (
        <span className={`badge text-[11px] ${priorityColors[item.priority]}`}>
          {priorityLabels[item.priority]} Priority
        </span>
      )}

      {/* Notes */}
      {item.notes && (
        <p className="text-[12px] text-[#6e6e73] mt-2 line-clamp-2">{item.notes}</p>
      )}

      {/* Added Date */}
      <p className="text-[11px] text-[#86868b] mt-3">
        Added {new Date(item.addedAt).toLocaleDateString()}
      </p>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
