import { Board } from "@/components/Board";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Kişisel Gelişim Dashboard
        </h1>
        <Board />
      </main>
    </div>
  );
}
