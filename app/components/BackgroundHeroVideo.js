"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundHeroVideo() {
  const videoRef = useRef(null);
  const [needsTap, setNeedsTap] = useState(false);
  const [loadSrc, setLoadSrc] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadSrc(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.playsInline = true;
    const tryPlay = () => {
      el.play().catch(() => setNeedsTap(true));
    };
    if (el.readyState >= 2) {
      tryPlay();
      return;
    }
    const onCanPlay = () => tryPlay();
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("loadedmetadata", onCanPlay);
    return () => {
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("loadedmetadata", onCanPlay);
    };
  }, [loadSrc]);

  return (
    <section className="relative h-[50vh] sm:h-[60vh] rounded-lg overflow-hidden border border-black/[.08] dark:border-white/[.145]">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/bardtylogo.jpg"
      >
        {loadSrc && (
          <>
            {/* Add a WebM if you have it: <source src="/bardty-hero.webm" type="video/webm" /> */}
            <source src="/bardty-prodvid.mp4" type="video/mp4" />
          </>
        )}
      </video>
      <div aria-hidden className="absolute inset-0 bg-black/30" />
      {needsTap && (
        <button
          onClick={() => videoRef.current?.play()}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/90 text-black text-sm font-medium shadow px-4 py-2"
          style={{ pointerEvents: "auto" }}
        >
          Tap to play
        </button>
      )}
    </section>
  );
}


