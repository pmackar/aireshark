"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { EntityType } from "@/lib/watchlist";

interface AddToWatchlistButtonProps {
  entityType: EntityType;
  entityId: string;
}

export default function AddToWatchlistButton({ entityType, entityId }: AddToWatchlistButtonProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkWatchStatus() {
      try {
        const response = await fetch("/api/watchlist/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityType, entityId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsWatched(data.data.isWatched);
            setWatchlistItemId(data.data.watchlistItemId);
          }
        }
      } catch (error) {
        console.error("Failed to check watch status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkWatchStatus();
  }, [entityType, entityId]);

  async function toggleWatch() {
    if (isToggling) return;

    setIsToggling(true);

    try {
      if (isWatched && watchlistItemId) {
        // Remove from watchlist
        const response = await fetch(`/api/watchlist/${watchlistItemId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsWatched(false);
          setWatchlistItemId(null);
          router.refresh();
        }
      } else {
        // Add to watchlist
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityType, entityId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsWatched(true);
            setWatchlistItemId(data.data.id);
            router.refresh();
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle watch status:", error);
    } finally {
      setIsToggling(false);
    }
  }

  if (isLoading) {
    return (
      <button
        disabled
        className="p-2 rounded-full bg-black/5 text-gray-400"
        title="Loading..."
      >
        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleWatch}
      disabled={isToggling}
      className={`
        p-2 rounded-full transition-all
        ${isWatched
          ? "bg-amber-100 text-amber-500 hover:bg-amber-200"
          : "bg-black/5 text-gray-400 hover:bg-black/10 hover:text-amber-500"
        }
        ${isToggling ? "opacity-50 cursor-not-allowed" : ""}
      `}
      title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
    >
      <svg
        className="w-5 h-5"
        fill={isWatched ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
}
