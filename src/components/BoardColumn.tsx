"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus, Category } from "@/types";
import { TaskCard } from "./TaskCard";

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  categories: Category[];
  onMoveNext: (id: string, nextStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function BoardColumn({
  status,
  title,
  tasks,
  categories,
  onMoveNext,
  onDelete,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[300px] w-full flex-col gap-2 rounded-xl border p-3 transition-colors ${
        isOver
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
          : "border-black/10 bg-neutral-50 dark:border-white/10 dark:bg-neutral-950"
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {title}
        </h2>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              categoryColor={categories.find((c) => c.name === task.category)?.color ?? undefined}
              onMoveNext={onMoveNext}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
