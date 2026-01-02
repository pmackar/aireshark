"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PIPELINE_COLORS = [
  "#14b8a6", // teal (default)
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo
];

export default function CreatePipelineButton() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PIPELINE_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim()) {
      setError("Please enter a pipeline name");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setName("");
        setDescription("");
        setColor(PIPELINE_COLORS[0]);
        router.refresh();
      } else {
        setError(data.error || "Failed to create pipeline");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        New Pipeline
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative glass-premium p-8 max-w-md w-full mx-4 animate-fade-in-scale">
            <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-6">
              Create Pipeline
            </h2>

            {error && (
              <div className="mb-4 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                Pipeline Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Acquisition Targets"
                className="
                  w-full px-4 py-2.5
                  text-[15px]
                  border border-black/10
                  rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                  transition-all
                "
              />
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                Description <span className="text-[#86868b]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will you track in this pipeline?"
                rows={2}
                className="
                  w-full px-4 py-2.5
                  text-[15px]
                  border border-black/10
                  rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                  transition-all
                  resize-none
                "
              />
            </div>

            <div className="mb-6">
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {PIPELINE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`
                      w-8 h-8 rounded-full
                      transition-all duration-200
                      ${color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}
                    `}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-[15px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="
                  flex-1 py-2.5
                  text-[15px] font-medium
                  bg-gradient-to-b from-teal-400 to-teal-500
                  text-white
                  rounded-xl
                  hover:from-teal-500 hover:to-teal-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all
                "
              >
                {isCreating ? "Creating..." : "Create Pipeline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
