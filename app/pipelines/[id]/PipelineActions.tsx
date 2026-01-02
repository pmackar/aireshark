"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PipelineActionsProps {
  pipeline: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
  };
}

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

export default function PipelineActions({ pipeline }: PipelineActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [name, setName] = useState(pipeline.name);
  const [description, setDescription] = useState(pipeline.description || "");
  const [color, setColor] = useState(pipeline.color || PIPELINE_COLORS[0]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate() {
    if (!name.trim()) {
      setError("Please enter a pipeline name");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/pipelines/${pipeline.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        router.refresh();
      } else {
        setError(data.error || "Failed to update pipeline");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/pipelines/${pipeline.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        router.push("/pipelines");
        router.refresh();
      } else {
        setError(data.error || "Failed to delete pipeline");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowEditModal(true)}
          className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-900 transition-colors"
          title="Edit Pipeline"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="p-2 rounded-full bg-black/5 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
          title="Delete Pipeline"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative glass-premium p-8 max-w-md w-full mx-4 animate-fade-in-scale">
            <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-6">
              Edit Pipeline
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
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 text-[15px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
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
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative glass-premium p-8 max-w-md w-full mx-4 animate-fade-in-scale">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h2 className="text-[21px] font-semibold text-[#1d1d1f] text-center mb-2">
              Delete Pipeline?
            </h2>
            <p className="text-[15px] text-[#6e6e73] text-center mb-6">
              This will permanently delete <strong>{pipeline.name}</strong> and all its items. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 text-[15px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="
                  flex-1 py-2.5
                  text-[15px] font-medium
                  bg-red-500
                  text-white
                  rounded-xl
                  hover:bg-red-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all
                "
              >
                {isDeleting ? "Deleting..." : "Delete Pipeline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
