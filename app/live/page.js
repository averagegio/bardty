"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Hls from "hls.js";

// Live page with HLS playback and basic SSE chat
export default function LivePage() {
  const [messages, setMessages] = useState([
    { id: 1, user: "host", text: "Welcome to the Bardty live!" },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const videoRef = useRef(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const muxPlaybackId = searchParams.get("playback_id") || process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID || "";
    const hlsUrlEnv = process.env.NEXT_PUBLIC_HLS_URL || "";
    const hlsUrl = muxPlaybackId
      ? `https://stream.mux.com/${muxPlaybackId}.m3u8`
      : hlsUrlEnv;
    const video = videoRef.current;
    if (!video) return;

    if (hlsUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegURL")) {
        video.src = hlsUrl;
      }
    }
  }, []);

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
          setMessages((prev) => [
            ...prev,
            { id: prev.length + 1, user: data.user || "anon", text: data.text || "" },
          ]);
        }
      } catch {}
    };
    return () => source.close();
  }, []);

  useEffect(() => {
    // Load recent history on mount
    (async () => {
      const res = await fetch("/api/chat/history");
      const data = await res.json().catch(() => ({ messages: [] }));
      if (Array.isArray(data.messages) && data.messages.length) {
        setMessages((prev) => {
          const merged = [...data.messages.map((m, i) => ({ id: i + 1, user: m.user || "anon", text: m.text || "" })), ...prev];
          // de-dupe naive by text+user
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
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      <section className="rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden">
        <div className="aspect-video bg-black">
          <video ref={videoRef} controls className="w-full h-full" poster="/bardtylogo.jpg" />
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
  );
}


