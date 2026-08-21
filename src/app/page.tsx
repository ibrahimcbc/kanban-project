import { Board } from "@/components/Board";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-rose-50 font-sans dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-xl font-bold text-slate-800 dark:text-slate-100">
          Kişisel Gelişim Dashboard
        </h1>
        <Board />
      </main>
    </div>
  );
}
