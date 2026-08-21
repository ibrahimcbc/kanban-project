"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus, Category } from "@/types";
import { TaskCard } from "./TaskCard";

export type ColumnAccent = "sky" | "amber" | "emerald";

const ACCENT_STYLES: Record<
  ColumnAccent,
  { header: string; badge: string; ring: string; dropBg: string }
> = {
  sky: {
    header: "text-sky-700 dark:text-sky-300",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    ring: "border-sky-200 dark:border-sky-500/20",
    dropBg: "bg-sky-50/80 dark:bg-sky-500/10",
  },
  amber: {
    header: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    ring: "border-amber-200 dark:border-amber-500/20",
    dropBg: "bg-amber-50/80 dark:bg-amber-500/10",
  },
  emerald: {
    header: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    ring: "border-emerald-200 dark:border-emerald-500/20",
    dropBg: "bg-emerald-50/80 dark:bg-emerald-500/10",
  },
};

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  accent: ColumnAccent;
  tasks: Task[];
  categories: Category[];
  onMoveNext: (id: string, nextStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}

export function BoardColumn({
  status,
  title,
  accent,
  tasks,
  categories,
  onMoveNext,
  onDelete,
  onOpen,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[320px] w-full flex-col gap-2.5 rounded-2xl border p-3 transition-colors ${
        isOver ? `${styles.ring} ${styles.dropBg}` : "border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40"
      }`}
    >
      <div className="mb-1 flex items-center justify-between px-1">
        <h2 className={`text-sm font-semibold ${styles.header}`}>{title}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}>
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              categoryColor={categories.find((c) => c.name === task.category)?.color ?? undefined}
              onMoveNext={onMoveNext}
              onDelete={onDelete}
              onOpen={onOpen}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
