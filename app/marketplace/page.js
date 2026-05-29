"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function MarketplacePage() {
  const router = useRouter();
  const aboutRef = useRef(null);
  const pricingRef = useRef(null);
  const storeRef = useRef(null);
  const [visible, setVisible] = useState({
    about: false,
    pricing: false,
    store: false,
  });

  useEffect(() => {
    const entriesToKeys = new Map([
      [aboutRef, "about"],
      [pricingRef, "pricing"],
      [storeRef, "store"],
    ]);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = entriesToKeys.get({ current: entry.target });
        });
      },
      { root: null, rootMargin: "0px 0px -15% 0px", threshold: [0, 0.06] }
    );
    // Observe with direct elements and map by element
    const elToKey = new Map();
    const els = [
      [aboutRef.current, "about"],
      [pricingRef.current, "pricing"],
      [storeRef.current, "store"],
    ].filter(([el]) => !!el);
    els.forEach(([el, key]) => {
      elToKey.set(el, key);
      io.observe(el);
    });
    const handler = (entries) => {
      entries.forEach((entry) => {
        const key = elToKey.get(entry.target);
        if (!key) return;
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          setVisible((v) => (v[key] ? v : { ...v, [key]: true }));
          io.unobserve(entry.target);
        }
      });
    };
    // Replace observer callback to use our map
    io.disconnect();
    const io2 = new IntersectionObserver(handler, {
      root: null,
      rootMargin: "0px 0px -15% 0px",
      threshold: [0, 0.06],
    });
    els.forEach(([el]) => io2.observe(el));
    return () => io2.disconnect();
  }, []);

  return (
    <>
      {/* Hero: very top, full-bleed, with bottom gradient into background */}
      <section className="relative isolate h-[100svh] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <video
          src="/vibus2.webm"
          autoPlay
          muted
          loop
          playsInline
          poster="/bardty-prodgif.gif"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-b from-transparent to-background"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 h-full flex items-center">
          <div className="w-full text-center">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">Shop on Stream</h1>
            <p className="mt-3 text-base sm:text-lg text-foreground/75">Live selling for modern creators.</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        ref={aboutRef}
        className={`relative mx-auto max-w-6xl px-4 sm:px-6 py-14 transition-all duration-700 ease-out will-change-[opacity,transform] ${
          visible.about ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 inset-x-0 h-6 bg-gradient-to-b from-transparent to-background"
        />
        <h2 className="text-xl font-semibold mb-3">About Us</h2>
        <p className="text-sm text-foreground/75 max-w-2xl">
          Bardty helps creators turn live moments into storefronts. Stream, chat, and sell—
          all in one place with an experience your audience will love.
        </p>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        ref={pricingRef}
        className={`relative mx-auto max-w-6xl px-4 sm:px-6 py-14 transition-all duration-700 ease-out will-change-[opacity,transform] ${
          visible.pricing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 inset-x-0 h-6 bg-gradient-to-b from-transparent to-background"
        />
        <h2 className="text-xl font-semibold mb-3">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-4">
            <div className="font-medium">Starter</div>
            <div className="text-sm text-foreground/70">Go live with essentials.</div>
          </div>
          <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-4">
            <div className="font-medium">Pro</div>
            <div className="text-sm text-foreground/70">Advanced shopping features.</div>
          </div>
          <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-4">
            <div className="font-medium">Business</div>
            <div className="text-sm text-foreground/70">Scale with analytics & support.</div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push("/pricing")}
            className="rounded-md border border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm hover:bg-foreground/5"
          >
            View detailed pricing
          </button>
        </div>
      </section>

      {/* Store */}
      <section
        id="store"
        ref={storeRef}
        className={`relative mx-auto max-w-6xl px-4 sm:px-6 py-14 transition-all duration-700 ease-out will-change-[opacity,transform] ${
          visible.store ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 inset-x-0 h-6 bg-gradient-to-b from-transparent to-background"
        />
        <h2 className="text-xl font-semibold mb-3">Store</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {["Hoodie", "Cap", "Sticker Pack"].map((name) => (
            <div key={name} className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-4">
              <div className="h-28 bg-foreground/5 rounded mb-3" />
              <div className="font-medium">Bardty {name}</div>
              <div className="text-sm text-foreground/70">$ 29.00</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => router.push("/cart")}
                  className="rounded-md bg-foreground text-background px-3 py-1.5 text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => router.push("/feed")}
                  className="rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-1.5 text-sm hover:bg-foreground/5"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

