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
  bucketName?: string;
  bucketColor?: string;
  projectName?: string;
  onMoveNext: (id: string, nextStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}

function deadlineStyle(deadline: string | null, isDone: boolean) {
  if (!deadline) return null;
  if (isDone) {
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  if (diffDays <= 2) return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
}

function formatDate(deadline: string) {
  const d = new Date(deadline);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function formatTimeRange(start: string, end: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)}–${fmt(end)}`;
}

export function TaskCard({
  task,
  bucketName,
  bucketColor,
  projectName,
  onMoveNext,
  onDelete,
  onOpen,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeftColor: bucketColor ?? "#6366f1",
  };

  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const nextStatus = STATUS_ORDER[currentIndex + 1];
  const dueStyle = deadlineStyle(task.deadline, task.status === "tamamlandi");

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onOpen(task.id)}
      className="cursor-pointer rounded-xl border border-l-4 border-slate-200/70 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 cursor-grab select-none text-slate-300 active:cursor-grabbing dark:text-slate-600"
          aria-label="Sürükle"
        >
          ⠿
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="break-words text-sm font-medium text-slate-800 dark:text-slate-100">
              {task.title}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              {task.urgency && (
                <span title="Acil">🔥</span>
              )}
              {task.importance && (
                <span className="text-amber-400" title="Önemli">
                  ★
                </span>
              )}
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {bucketName && (
              <span
                className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: bucketColor ?? "#6366f1" }}
              >
                {bucketName}
              </span>
            )}
            {projectName && (
              <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                📁 {projectName}
              </span>
            )}
            {task.deadline && (
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${dueStyle}`}>
                {formatDate(task.deadline)}
              </span>
            )}
            {task.start_time && task.end_time && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                {task.google_event_id && <span title="Google Calendar'da">📅</span>}
                {formatTimeRange(task.start_time, task.end_time)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        {nextStatus ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveNext(task.id, nextStatus);
            }}
            className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
          >
            → {STATUS_LABELS[nextStatus]}
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
