"use client";

import { useState } from "react";
import { Category } from "@/types";

interface AddTaskFormProps {
  categories: Category[];
  onAdd: (title: string, category: string) => Promise<void>;
}

export function AddTaskForm({ categories, onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]?.name ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) return;
    setSubmitting(true);
    try {
      await onAdd(title.trim(), category);
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
        className="min-w-[180px] flex-1 rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        Ekle
      </button>
    </form>
  );
}
