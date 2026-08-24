"use client";

import { useEffect, useState } from "react";

export function GoogleCalendarStatus() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/google/status")
      .then((res) => (res.ok ? res.json() : { connected: false }))
      .then((json) => setConnected(json.connected))
      .catch(() => setConnected(false));
  }, []);

  async function handleDisconnect() {
    await fetch("/api/auth/google/status", { method: "DELETE" });
    setConnected(false);
  }

  if (connected === null) return null;

  if (connected) {
    return (
      <button
        onClick={handleDisconnect}
        title="Bağlantıyı kes"
        className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
      >
        📅 Calendar bağlı
      </button>
    );
  }

  return (
    <a
      href="/api/auth/google"
      className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      📅 Calendar&apos;a bağlan
    </a>
  );
}
