"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EntityType } from "@/lib/watchlist";

interface WatchlistItemCardProps {
  item: {
    id: string;
    addedAt: Date;
    notes: string | null;
  };
  entity: {
    type: EntityType;
    name: string;
    slug: string;
  };
  index: number;
}

const entityTypeLabels: Record<EntityType, string> = {
  firm: "PE Firm",
  platform: "Platform",
  brand: "Brand",
};

const entityTypeColors: Record<EntityType, string> = {
  firm: "bg-purple-100 text-purple-700",
  platform: "bg-blue-100 text-blue-700",
  brand: "bg-green-100 text-green-700",
};

const entityTypeLinks: Record<EntityType, string> = {
  firm: "/firms",
  platform: "/firms",
  brand: "/brands",
};

export default function WatchlistItemCard({ item, entity, index }: WatchlistItemCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (isRemoving) return;

    setIsRemoving(true);
    try {
      const response = await fetch(`/api/watchlist/${item.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    } finally {
      setIsRemoving(false);
    }
  }

  const href = `${entityTypeLinks[entity.type]}/${entity.slug}`;

  return (
    <Link href={href}>
      <div
        className="glass-card p-5 h-full opacity-0 animate-fade-in-scale group cursor-pointer"
        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
      >
        <div className="flex items-start justify-between mb-3">
          <span className={`badge ${entityTypeColors[entity.type]}`}>
            {entityTypeLabels[entity.type]}
          </span>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
            title="Remove from watchlist"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2 group-hover:text-teal-600 transition-colors">
          {entity.name}
        </h3>

        {item.notes && (
          <p className="text-[13px] text-[#6e6e73] line-clamp-2 mb-2">{item.notes}</p>
        )}

        <p className="text-[12px] text-[#86868b]">
          Added {new Date(item.addedAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
