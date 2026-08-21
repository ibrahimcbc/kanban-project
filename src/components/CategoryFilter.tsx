"use client";

import { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
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
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.name)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected === c.name
              ? "text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
          style={selected === c.name ? { backgroundColor: c.color ?? "#6366f1" } : undefined}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
