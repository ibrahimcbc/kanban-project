"use client";

export type ViewOption = "tumu" | "bugun" | "bu-hafta" | "tarihsiz";

const VIEWS: { value: ViewOption; label: string }[] = [
  { value: "tumu", label: "Tümü" },
  { value: "bugun", label: "Bugün" },
  { value: "bu-hafta", label: "Bu Hafta" },
  { value: "tarihsiz", label: "Tarihsiz" },
];

interface ViewFilterProps {
  selected: ViewOption;
  onSelect: (view: ViewOption) => void;
}

export function ViewFilter({ selected, onSelect }: ViewFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {VIEWS.map((v) => (
        <button
          key={v.value}
          onClick={() => onSelect(v.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected === v.value
              ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function taskDate(task: { deadline: string | null; start_time: string | null }): Date | null {
  if (task.start_time) return new Date(task.start_time);
  if (task.deadline) return new Date(task.deadline);
  return null;
}

export function taskMatchesView(
  task: { deadline: string | null; start_time: string | null },
  view: ViewOption
): boolean {
  if (view === "tumu") return true;

  const date = taskDate(task);

  if (view === "tarihsiz") return date === null;
  if (date === null) return false;

  const today = startOfDay(new Date());
  const target = startOfDay(date);

  if (view === "bugun") return target.getTime() === today.getTime();

  if (view === "bu-hafta") {
    const weekFromToday = new Date(today);
    weekFromToday.setDate(weekFromToday.getDate() + 7);
    return target.getTime() >= today.getTime() && target.getTime() < weekFromToday.getTime();
  }

  return true;
}
