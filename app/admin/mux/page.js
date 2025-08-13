"use client";

import { useState } from "react";

export default function AdminMuxPage() {
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  async function createLive() {
    setError(null);
    setResp(null);
    const r = await fetch("/api/mux/live", { method: "POST" });
    if (!r.ok) {
      setError("Failed to create stream. Ensure MUX_TOKEN_ID and MUX_TOKEN_SECRET are set.");
      return;
    }
    const data = await r.json();
    setResp(data);
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">Mux Live Admin</h1>
      <p className="text-sm text-foreground/70">Create a live stream and get your RTMP stream key.</p>
      <button onClick={createLive} className="w-fit rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">Create Live Stream</button>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {resp && (
        <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-4 text-sm grid gap-2">
          <div><span className="font-medium">Stream Key:</span> <code>{resp.stream_key}</code></div>
          <div><span className="font-medium">Playback ID:</span> <code>{resp.playback_id}</code></div>
          <div><span className="font-medium">HLS:</span> <code>https://stream.mux.com/{resp.playback_id}.m3u8</code></div>
          <div><span className="font-medium">RTMP URL:</span> <code>rtmps://global-live.mux.com:443/app</code></div>
          <div className="pt-2">
            After you go live, open <a className="underline" href={`/live?playback_id=${resp.playback_id}`}>Live</a> to preview.
          </div>
        </div>
      )}
    </div>
  );
}


