"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskStatus } from "@/types";

const STATUS_ORDER: TaskStatus[] = ["yapilacak", "yapiliyor", "tamamlandi"];
const STATUS_LABELS: Record<TaskStatus, string> = {
  yapilacak: "Yapılacak",
  yapiliyor: "Yapılıyor",
  tamamlandi: "Tamamlandı",
};

interface TaskCardProps {
  task: Task;
  categoryColor?: string;
  onMoveNext: (id: string, nextStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, categoryColor, onMoveNext, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const nextStatus = STATUS_ORDER[currentIndex + 1];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab select-none text-neutral-400 active:cursor-grabbing"
          aria-label="Sürükle"
        >
          ⠿
        </div>
        <div className="flex-1 min-w-0">
          <p className="break-words text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {task.title}
          </p>
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs text-white"
            style={{ backgroundColor: categoryColor ?? "#64748b" }}
          >
            {task.category}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        {nextStatus ? (
          <button
            onClick={() => onMoveNext(task.id, nextStatus)}
            className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            → {STATUS_LABELS[nextStatus]}
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
