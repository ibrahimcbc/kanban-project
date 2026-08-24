"use client";

import { useState } from "react";
import { Bucket } from "@/types";

interface AddTaskFormProps {
  buckets: Bucket[];
  onAdd: (title: string, bucketId: string) => Promise<void>;
}

export function AddTaskForm({ buckets, onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [bucketId, setBucketId] = useState(buckets[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bucketId) return;
    setSubmitting(true);
    try {
      await onAdd(title.trim(), bucketId);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Yeni görev ekle..."
        className="min-w-[180px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      />
      <select
        value={bucketId}
        onChange={(e) => setBucketId(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        {buckets.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-40"
      >
        Ekle
      </button>
    </form>
  );
}
