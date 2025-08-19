"use client";

import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, createLocalVideoTrack, createLocalAudioTrack } from "livekit-client";
import { useRouter, useSearchParams } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";

export default function LiveClient() {
  const [messages, setMessages] = useState([
    { id: 1, user: "host", text: "Welcome to the Bardty live!" },
  ]);
  const [input, setInput] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [liveCreating, setLiveCreating] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [liveInfo, setLiveInfo] = useState(null);
  const chatRef = useRef(null);
  const videoRef = useRef(null);
  const [room, setRoom] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
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

  const playbackId = (searchParams.get("playback_id") || process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID || "");
  const [ingestInfo, setIngestInfo] = useState(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/login", { cache: "no-store" });
        const data = await res.json();
        if (data && data.authenticated) setAuthUser(data.user);
      } catch {}
    })();
  }, []);

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

  useEffect(() => {
    (async () => {
      if (!playbackId) return;
      try {
        const res = await fetch(`/api/mux/info?playback_id=${encodeURIComponent(playbackId)}`);
        const data = await res.json().catch(() => null);
        if (data && data.found) setIngestInfo(data.info);
      } catch {}
    })();
  }, [playbackId]);

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

  async function createLive() {
    setLiveError("");
    setLiveCreating(true);
    try {
      const res = await fetch("/api/mux/live", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.playback_id) {
        setLiveError(data?.error || "Failed to create live stream");
        return;
      }
      setLiveInfo(data);
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("cat", selectedCat);
      params.set("playback_id", data.playback_id);
      router.push(`/live?${params.toString()}`);
    } catch (e) {
      setLiveError("Network error");
    } finally {
      setLiveCreating(false);
    }
  }

  async function startLivekitPublish() {
    setPublishError("");
    setPublishing(true);
    try {
      const res = await fetch("/api/livekit/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: authUser?.sub || "host" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token || !data.url) {
        setPublishError(data?.error || "Failed to get LiveKit token");
        return;
      }
      const r = new Room();
      r.on(RoomEvent.Disconnected, () => {
        setPublishing(false);
      });
      await r.connect(data.url, data.token);
      setRoom(r);
      const [cam, mic] = await Promise.all([
        createLocalVideoTrack(),
        createLocalAudioTrack(),
      ]);
      await r.localParticipant.publishTrack(cam);
      await r.localParticipant.publishTrack(mic);
      if (videoRef.current) {
        cam.attach(videoRef.current);
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e) {
      setPublishError(e?.message || "Failed to publish to LiveKit");
    } finally {
      setPublishing(false);
    }
  }

  async function stopLivekitPublish() {
    try {
      const current = room;
      if (current) {
        current.disconnect();
      }
    } catch {}
  }

  async function submitAuth() {
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = authMode === "signup" ? "/api/signup" : "/api/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        return;
      }
      // Refresh session
      const meRes = await fetch("/api/login", { cache: "no-store" });
      const me = await meRes.json().catch(() => ({}));
      if (me && me.authenticated) setAuthUser(me.user);
      setAuthOpen(false);
    } catch (e) {
      setAuthError("Network error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/logout", { method: "POST" });
      setAuthUser(null);
    } catch {}
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-black/[.08] dark:border-white/[.145] flex-wrap">
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
        {authUser ? (
          <button
            aria-label="Create live stream"
            onClick={createLive}
            disabled={liveCreating}
            className="ml-auto rounded-md border px-3 py-1 text-xs hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145] disabled:opacity-60"
          >{liveCreating ? 'Creating…' : 'Record'}</button>
        ) : (
          <span className="ml-auto text-xs text-foreground/60">Sign in to record</span>
        )}
        <button
          aria-label="Open menu"
          onClick={() => setAuthOpen(true)}
          className="mr-2 rounded-md border px-3 py-1 text-xs hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]"
        >
          ☰
        </button>
      </div>

      {liveInfo ? (
        <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-3 text-xs grid gap-2">
          <div className="font-medium">Ingest details</div>
          <div>Server: <code className="opacity-80">rtmps://global-live.mux.com:443/app</code></div>
          <div className="flex items-center gap-2">
            <span>Stream key:</span>
            <code className="truncate opacity-80">{liveInfo.stream_key}</code>
            <button
              onClick={() => navigator.clipboard?.writeText(liveInfo.stream_key)}
              className="rounded-md border px-2 py-1 hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]"
            >Copy</button>
          </div>
          <div>Playback ID: <code className="opacity-80">{liveInfo.playback_id}</code></div>
        </div>
      ) : null}

      {liveError ? <div className="text-xs text-red-600">{liveError}</div> : null}

      {authOpen && (
        <>
          <div
            onClick={() => setAuthOpen(false)}
            className="fixed inset-0 bg-black/30"
          />
          <div className="fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-background border-l border-black/[.08] dark:border-white/[.145] shadow-lg flex flex-col">
            <div className="p-3 border-b border-black/[.08] dark:border-white/[.145] flex items-center justify-between">
              <div className="font-medium text-sm">{authUser ? 'Account' : (authMode === 'signup' ? 'Create account' : 'Login')}</div>
              <button onClick={() => setAuthOpen(false)} className="text-sm opacity-70 hover:opacity-100">✕</button>
            </div>

            {authUser ? (
              <div className="p-4 grid gap-3">
                <div className="text-sm">Signed in as <span className="font-medium">{authUser.sub}</span></div>
                <button onClick={logout} className="rounded-md border px-3 py-2 text-sm hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]">Logout</button>
              </div>
            ) : (
              <>
                <div className="p-3 flex gap-2">
                  <button
                    className={`flex-1 rounded px-2 py-1 text-xs ${authMode === 'login' ? 'bg-foreground text-background' : 'border border-black/[.08] dark:border-white/[.145]'}`}
                    onClick={() => setAuthMode('login')}
                  >Login</button>
                  <button
                    className={`flex-1 rounded px-2 py-1 text-xs ${authMode === 'signup' ? 'bg-foreground text-background' : 'border border-black/[.08] dark:border-white/[.145]'}`}
                    onClick={() => setAuthMode('signup')}
                  >Signup</button>
                </div>
                <div className="p-4 grid gap-2">
                  <input
                    value={authForm.username}
                    onChange={(e) => setAuthForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="Username"
                    className="rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-2 text-sm bg-background"
                  />
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Password"
                    className="rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-2 text-sm bg-background"
                  />
                  {authError ? <div className="text-xs text-red-600">{authError}</div> : null}
                  <button
                    disabled={authLoading}
                    onClick={submitAuth}
                    className="rounded-md bg-foreground text-background px-3 py-2 text-sm font-medium disabled:opacity-60"
                  >{authLoading ? 'Please wait...' : (authMode === 'signup' ? 'Create account' : 'Login')}</button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {ingestInfo ? (
        <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-3 text-xs grid gap-2">
          <div className="font-medium">Ingest details</div>
          <div>Server: <code className="opacity-80">rtmps://global-live.mux.com:443/app</code></div>
          <div className="flex items-center gap-2">
            <span>Stream key:</span>
            <code className="truncate opacity-80">{ingestInfo.stream_key}</code>
            <button
              onClick={() => navigator.clipboard?.writeText(ingestInfo.stream_key)}
              className="rounded-md border px-2 py-1 hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]"
            >Copy</button>
          </div>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <section className="rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden">
          <div className="aspect-video bg-black">
            {playbackId ? (
              <MuxPlayer
                streamType="live"
                playbackId={playbackId}
                autoPlay
                muted
                poster="/bardtylogo.jpg"
                style={{ width: "100%", height: "100%" }}
                primaryColor="#ff4dd2"
              />
            ) : (
              <video ref={videoRef} controls playsInline className="w-full h-full" poster="/bardtylogo.jpg" />
            )}
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
            <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-3 mb-4 text-xs grid gap-2">
              <div className="font-medium">Go live (two options)</div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <div className="font-medium">In browser (LiveKit)</div>
                  <button
                    onClick={startLivekitPublish}
                    disabled={publishing}
                    className="rounded-md bg-foreground text-background px-3 py-2 text-sm font-medium disabled:opacity-60"
                  >{publishing ? 'Starting…' : 'Start camera'}</button>
                  <button
                    onClick={stopLivekitPublish}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]"
                  >Stop</button>
                  {publishError ? <div className="text-xs text-red-600">{publishError}</div> : null}
                </div>
                <div className="grid gap-2">
                  <div className="font-medium">Stream with OBS (Mux RTMP)</div>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Click Record to create a Mux stream.</li>
                    <li>Copy Server and Stream key below.</li>
                    <li>In OBS: Settings → Stream → Service: Custom → Server + Stream Key.</li>
                    <li>Start Streaming. Watch via playback link.</li>
                  </ol>
                </div>
              </div>
            </div>
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


