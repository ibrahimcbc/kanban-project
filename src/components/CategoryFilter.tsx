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
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
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
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          }`}
          style={selected === c.name ? { backgroundColor: c.color ?? "#64748b" } : undefined}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
