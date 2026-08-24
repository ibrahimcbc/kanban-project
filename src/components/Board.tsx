"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Task, TaskStatus, Category } from "@/types";
import { BoardColumn, ColumnAccent } from "./BoardColumn";
import { AddTaskForm } from "./AddTaskForm";
import { CategoryFilter } from "./CategoryFilter";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { GoogleCalendarStatus } from "./GoogleCalendarStatus";

const COLUMNS: { status: TaskStatus; title: string; accent: ColumnAccent }[] = [
  { status: "yapilacak", title: "Yapılacak", accent: "sky" },
  { status: "yapiliyor", title: "Yapılıyor", accent: "amber" },
  { status: "tamamlandi", title: "Tamamlandı", accent: "emerald" },
];

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarNotice] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const calendarParam = new URLSearchParams(window.location.search).get("calendar");
    if (!calendarParam) return null;
    const messages: Record<string, string> = {
      connected: "Google Calendar bağlandı.",
      denied: "Google Calendar bağlantısı reddedildi.",
      error: "Google Calendar bağlanırken hata oluştu.",
    };
    window.history.replaceState({}, "", window.location.pathname);
    return messages[calendarParam] ?? null;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  useEffect(() => {
    (async () => {
      try {
        const [tasksRes, categoriesRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/categories"),
        ]);
        if (!tasksRes.ok || !categoriesRes.ok) {
          throw new Error("Veriler yüklenemedi. Supabase bağlantınızı kontrol edin.");
        }
        setTasks(await tasksRes.json());
        setCategories(await categoriesRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredTasks = useMemo(
    () =>
      selectedCategory ? tasks.filter((t) => t.category === selectedCategory) : tasks,
    [tasks, selectedCategory]
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { yapilacak: [], yapiliyor: [], tamamlandi: [] };
    for (const task of filteredTasks) {
      map[task.status].push(task);
    }
    return map;
  }, [filteredTasks]);

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) ?? null : null;

  async function updateTask(id: string, updates: Partial<Task>) {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      setTasks(previous);
      setError("Görev güncellenemedi");
    }
  }

  function updateTaskStatus(id: string, status: TaskStatus) {
    updateTask(id, { status });
  }

  async function handleAdd(title: string, category: string) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category }),
    });
    if (!res.ok) {
      setError("Görev eklenemedi");
      return;
    }
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
  }

  async function handleDelete(id: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setTasks(previous);
      setError("Görev silinemedi");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    const targetStatus = COLUMNS.some((c) => c.status === overId)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (targetStatus && targetStatus !== activeTask.status) {
      updateTaskStatus(activeTask.id, targetStatus);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Yükleniyor...</p>;
  }

  if (error && tasks.length === 0 && categories.length === 0) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}
      {calendarNotice && (
        <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
          {calendarNotice}
        </div>
      )}
      <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <AddTaskForm categories={categories} onAdd={handleAdd} />
          </div>
          <GoogleCalendarStatus />
        </div>
        <div className="mt-3">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.status}
              status={col.status}
              title={col.title}
              accent={col.accent}
              tasks={tasksByStatus[col.status]}
              categories={categories}
              onMoveNext={updateTaskStatus}
              onDelete={handleDelete}
              onOpen={setSelectedTaskId}
            />
          ))}
        </div>
      </DndContext>
      {selectedTask && (
        <TaskDetailPanel
          key={selectedTask.id}
          task={selectedTask}
          categories={categories}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={updateTask}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
