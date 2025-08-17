"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecordLiveButton() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function onClick() {
    setCreating(true);
    try {
      const res = await fetch("/api/mux/live", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.playback_id) {
        router.push(`/live?playback_id=${data.playback_id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={creating}
      className="rounded-md border px-3 py-1 text-xs hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145] disabled:opacity-60"
      aria-label="Create live stream"
    >
      {creating ? "Creating…" : "Record Live"}
    </button>
  );
}


