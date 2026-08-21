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
import { BoardColumn } from "./BoardColumn";
import { AddTaskForm } from "./AddTaskForm";
import { CategoryFilter } from "./CategoryFilter";

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: "yapilacak", title: "Yapılacak" },
  { status: "yapiliyor", title: "Yapılıyor" },
  { status: "tamamlandi", title: "Tamamlandı" },
];

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function updateTaskStatus(id: string, status: TaskStatus) {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setTasks(previous);
      setError("Görev güncellenemedi");
    }
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
    return <p className="text-sm text-neutral-500">Yükleniyor...</p>;
  }

  if (error && tasks.length === 0 && categories.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
      <AddTaskForm categories={categories} onAdd={handleAdd} />
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.status}
              status={col.status}
              title={col.title}
              tasks={tasksByStatus[col.status]}
              categories={categories}
              onMoveNext={updateTaskStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
