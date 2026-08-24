"use client";

import { Bucket } from "@/types";

interface BucketFilterProps {
  buckets: Bucket[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function BucketFilter({ buckets, selected, onSelect }: BucketFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selected === null
            ? "bg-violet-600 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        }`}
      >
        Tümü
      </button>
      {buckets.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected === b.id
              ? "text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
          style={selected === b.id ? { backgroundColor: b.color ?? "#6366f1" } : undefined}
        >
          {b.name}
        </button>
      ))}
    </div>
  );
}
