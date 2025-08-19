"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(null);
  const heroVideoRef = useRef(null);

  useEffect(() => {
    const el = heroVideoRef.current;
    if (!el) return;
    el.muted = true;
    el.playsInline = true;
    const tryPlay = () => {
      el.play().catch(() => {});
    };
    if (el.readyState >= 2) {
      tryPlay();
      return;
    }
    const onCanPlay = () => {
      tryPlay();
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("canplaythrough", onCanPlay);
      el.removeEventListener("loadedmetadata", onCanPlay);
    };
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("canplaythrough", onCanPlay);
    el.addEventListener("loadedmetadata", onCanPlay);
    return () => {
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("canplaythrough", onCanPlay);
      el.removeEventListener("loadedmetadata", onCanPlay);
    };
  }, []);

  async function createLive() {
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/mux/live", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.playback_id) {
        setError(data?.error || "Failed to create live stream");
        return;
      }
      setInfo(data);
      router.push(`/live?playback_id=${data.playback_id}`);
    } catch (e) {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      {/* Background hero video */}
      <section className="relative h-[50vh] sm:h-[60vh] rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden">
        <video
          ref={heroVideoRef}
          src="/bardty-prodvid.mp4"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/bardtylogo.jpg"
        />
        <div aria-hidden className="absolute inset-0 bg-black/30" />
      </section>

      <div className="grid gap-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Go Live with Bardty</h1>
        <p className="text-sm text-foreground/70">Create a Mux live stream and start broadcasting instantly.</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={createLive}
          disabled={creating}
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-60"
        >{creating ? "Creating…" : "Create Stream"}</button>
        <button
          onClick={() => router.push("/live")}
          className="rounded-md border px-4 py-2 text-sm hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]"
        >Go to Live Page</button>
      </div>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
      {info ? (
        <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-3 text-xs grid gap-2">
          <div className="font-medium">Ingest details</div>
          <div>Server: <code className="opacity-80">rtmps://global-live.mux.com:443/app</code></div>
          <div className="flex items-center gap-2">
            <span>Stream key:</span>
            <code className="truncate opacity-80">{info.stream_key}</code>
            <button
              onClick={() => navigator.clipboard?.writeText(info.stream_key)}
              className="rounded-md border px-2 py-1 hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]"
            >Copy</button>
          </div>
          <div>Playback ID: <code className="opacity-80">{info.playback_id}</code></div>
        </div>
      ) : null}
      </div>
    </>
  );
}
