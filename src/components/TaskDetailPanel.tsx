"use client";

import { useEffect, useRef, useState } from "react";
import { Task, Category } from "@/types";

interface TaskDetailPanelProps {
  task: Task;
  categories: Category[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskDetailPanel({
  task,
  categories,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleNotesChange(value: string) {
    setNotes(value);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      onUpdate(task.id, { notes: value });
    }, 600);
  }

  function handleTitleBlur() {
    if (title.trim() && title !== task.title) {
      onUpdate(task.id, { title: title.trim() });
    } else {
      setTitle(task.title);
    }
  }

  function toLocalInputValue(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function fromLocalInputValue(value: string): string | null {
    if (!value) return null;
    return new Date(value).toISOString();
  }

  function handleStartTimeChange(value: string) {
    const iso = fromLocalInputValue(value);
    const updates: Partial<Task> = { start_time: iso };
    // Bitiş boşsa veya başlangıçtan önceyse, 1 saatlik varsayılan bir aralık kur.
    if (iso && (!task.end_time || new Date(task.end_time) <= new Date(iso))) {
      updates.end_time = new Date(new Date(iso).getTime() + 60 * 60 * 1000).toISOString();
    }
    onUpdate(task.id, updates);
  }

  const categoryColor = categories.find((c) => c.name === task.category)?.color ?? "#6366f1";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-900">
        <div
          className="h-2 w-full shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
        <div className="flex items-center justify-between px-5 pt-4">
          <select
            value={task.category}
            onChange={(e) => onUpdate(task.id, { category: e.target.value })}
            className="rounded-full px-3 py-1 text-xs font-semibold text-white outline-none"
            style={{ backgroundColor: categoryColor }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name} className="text-slate-900">
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-4">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            rows={2}
            className="resize-none border-none bg-transparent text-xl font-semibold leading-snug text-slate-900 outline-none dark:text-white"
            placeholder="Görev başlığı"
          />

          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Deadline
              <input
                type="date"
                value={task.deadline ?? ""}
                onChange={(e) => onUpdate(task.id, { deadline: e.target.value || null })}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Öncelik
              <button
                type="button"
                onClick={() => onUpdate(task.id, { is_important: !task.is_important })}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  task.is_important
                    ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400"
                    : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <span>{task.is_important ? "★" : "☆"}</span>
                {task.is_important ? "Önemli" : "Önemsiz"}
              </button>
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Başlangıç
              <input
                type="datetime-local"
                value={toLocalInputValue(task.start_time)}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-violet-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Bitiş
              <input
                type="datetime-local"
                value={toLocalInputValue(task.end_time)}
                onChange={(e) => onUpdate(task.id, { end_time: fromLocalInputValue(e.target.value) })}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-violet-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            {task.start_time && task.end_time && (
              <span
                className={`mb-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                  task.google_event_id
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {task.google_event_id ? "📅 Takvimde" : "Takvime eklenmedi"}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Notlar
            </span>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Buraya uzun uzun yazabilirsiniz..."
              className="min-h-[280px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 outline-none focus:border-violet-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-800"
            />
          </div>
        </div>

        <div className="mt-auto flex justify-end border-t border-slate-100 px-5 py-3 dark:border-slate-800">
          <button
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            Görevi sil
          </button>
        </div>
      </div>
    </div>
  );
}
