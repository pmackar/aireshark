"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { EntityType } from "@/lib/pipeline";

interface Pipeline {
  id: string;
  name: string;
  color: string | null;
}

interface AddToPipelineButtonProps {
  entityType: EntityType;
  entityId: string;
}

export default function AddToPipelineButton({ entityType, entityId }: AddToPipelineButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (showDropdown && pipelines.length === 0) {
      fetchPipelines();
    }
  }, [showDropdown, pipelines.length]);

  async function fetchPipelines() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pipelines");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPipelines(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch pipelines:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function addToPipeline(pipelineId: string) {
    if (isAdding) return;

    setIsAdding(pipelineId);

    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId }),
      });

      if (response.ok) {
        setShowDropdown(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add to pipeline:", error);
    } finally {
      setIsAdding(null);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-full bg-black/5 text-gray-400 hover:bg-black/10 hover:text-teal-500 transition-all"
        title="Add to pipeline"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
          />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-black/5 py-2 z-20">
            <div className="px-3 py-2 text-[11px] font-medium text-[#86868b] uppercase tracking-wide">
              Add to Pipeline
            </div>

            {isLoading ? (
              <div className="px-3 py-4 text-center text-[13px] text-[#86868b]">
                Loading...
              </div>
            ) : pipelines.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-[13px] text-[#86868b] mb-2">No pipelines yet</p>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push("/pipelines");
                  }}
                  className="text-[13px] text-teal-600 hover:text-teal-700 font-medium"
                >
                  Create one
                </button>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {pipelines.map((pipeline) => (
                  <button
                    key={pipeline.id}
                    onClick={() => addToPipeline(pipeline.id)}
                    disabled={isAdding === pipeline.id}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-black/5 text-left disabled:opacity-50"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pipeline.color || "#14b8a6" }}
                    />
                    <span className="text-[13px] text-[#1d1d1f] truncate">
                      {pipeline.name}
                    </span>
                    {isAdding === pipeline.id && (
                      <svg className="w-4 h-4 animate-spin ml-auto text-teal-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-black/5 mt-2 pt-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  router.push("/pipelines");
                }}
                className="w-full px-3 py-2 text-[13px] text-teal-600 hover:bg-black/5 text-left font-medium"
              >
                Manage Pipelines
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
