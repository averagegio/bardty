"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Hls from "hls.js";

export default function LiveClient() {
  const [messages, setMessages] = useState([
    { id: 1, user: "host", text: "Welcome to the Bardty live!" },
  ]);
  const [input, setInput] = useState("
");
  const chatRef = useRef(null);
  const videoRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const categories = [
    { slug: "retail", label: "Retail" },
    { slug: "furniture", label: "Furniture" },
    { slug: "skills", label: "Skills" },
    { slug: "real-estate", label: "Real Estate" },
  ];
  const selectedCat = searchParams.get("cat") || categories[0].slug;

  const MOCK_CHANNELS = {
    retail: [
      { id: "r1", title: "Daily Deals", playbackId: "" },
      { id: "r2", title: "Streetwear Drops", playbackId: "" },
    ],
    furniture: [
      { id: "f1", title: "Cozy Living Room", playbackId: "" },
      { id: "f2", title: "Minimalist Office", playbackId: "" },
    ],
    skills: [
      { id: "s1", title: "DIY Woodwork", playbackId: "" },
      { id: "s2", title: "Quick Cooking Hacks", playbackId: "" },
    ],
    "real-estate": [
      { id: "re1", title: "Open House Tour", playbackId: "" },
      { id: "re2", title: "Market Watch", playbackId: "" },
    ],
  };

  useEffect(() => {
    const muxPlaybackId = searchParams.get("playback_id") || process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID || "";
    const hlsUrlEnv = process.env.NEXT_PUBLIC_HLS_URL || "";
    const hlsUrl = muxPlaybackId ? `https://stream.mux.com/${muxPlaybackId}.m3u8` : hlsUrlEnv;
    const video = videoRef.current;
    if (!video) return;

    if (hlsUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegURL")) {
        video.src = hlsUrl;
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const source = new EventSource("/api/chat");
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          setMessages((prev) => [...prev, { id: prev.length + 1, user: data.user || "anon", text: data.text || "" }]);
        }
      } catch {}
    };
    return () => source.close();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/chat/history");
      const data = await res.json().catch(() => ({ messages: [] }));
      if (Array.isArray(data.messages) && data.messages.length) {
        setMessages((prev) => {
          const merged = [
            ...data.messages.map((m, i) => ({ id: i + 1, user: m.user || "anon", text: m.text || "" })),
            ...prev,
          ];
          const seen = new Set();
          return merged.filter((m) => {
            const key = `${m.user}:${m.text}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        });
      }
    })();
  }, []);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: "you", text }),
    });
  }

  async function addToCart(sku) {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku, qty: 1 }),
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-black/[.08] dark:border-white/[.145] overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            role="tab"
            aria-selected={selectedCat === cat.slug}
            onClick={() => {
              const params = new URLSearchParams(Array.from(searchParams.entries()));
              params.set("cat", cat.slug);
              router.push(`/live?${params.toString()}`);
            }}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              selectedCat === cat.slug ? "border-foreground font-medium" : "border-transparent text-foreground/70 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <section className="rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden">
          <div className="aspect-video bg-black">
            <video ref={videoRef} controls playsInline className="w-full h-full" poster="/bardtylogo.jpg" />
          </div>
          <div className="p-4 grid gap-2">
            <div className="text-sm text-foreground/70">Featured Product</div>
            <div className="flex items-center justify-between">
              <div className="font-medium">Bardty Hoodie</div>
              <div className="text-sm">$ 49.00</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">Buy Now</button>
              <button onClick={() => addToCart("Bardty Hoodie")} className="rounded-md border border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm font-medium hover:bg-foreground/5">Add to Cart</button>
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm font-medium mb-3">Live now in {categories.find((c) => c.slug === selectedCat)?.label}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(MOCK_CHANNELS[selectedCat] || []).map((ch) => (
                <div key={ch.id} className="rounded-md border border-black/[.08] dark:border-white/[.145] p-3 grid gap-2">
                  <div className="aspect-video bg-foreground/10 rounded" />
                  <div className="text-sm font-medium truncate">{ch.title}</div>
                  <button
                    className="rounded-md border px-3 py-1 text-xs hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]"
                    onClick={() => {
                      const params = new URLSearchParams(Array.from(searchParams.entries()));
                      if (ch.playbackId) params.set("playback_id", ch.playbackId);
                      params.set("cat", selectedCat);
                      router.push(`/live?${params.toString()}`);
                    }}
                  >
                    Watch
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-black/[.08] dark:border-white/[.145] flex flex-col min-h-[60vh]">
          <div className="px-4 py-3 border-b border-black/[.08] dark:border-white/[.145] font-medium">Live Chat</div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 grid gap-2">
            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-medium mr-2">{m.user}:</span>
                <span className="text-foreground/80">{m.text}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-black/[.08] dark:border-white/[.145] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              className="flex-1 rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-2 text-sm bg-background"
            />
            <button onClick={sendMessage} className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">Send</button>
          </div>
        </aside>
      </div>
    </div>
  );
}


