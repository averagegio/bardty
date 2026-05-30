"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { pricingPlans } from "@/lib/pricing";

export default function HomePage() {
  const router = useRouter();
  const aboutRef = useRef(null);
  const pricingRef = useRef(null);
  const storeRef = useRef(null);
  const [visible, setVisible] = useState({
    about: false,
    pricing: false,
    store: false,
  });
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    const elToKey = new Map();
    const els = [
      [aboutRef.current, "about"],
      [pricingRef.current, "pricing"],
      [storeRef.current, "store"],
    ].filter(([el]) => !!el);
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
    const io = new IntersectionObserver(handler, {
      root: null,
      rootMargin: "0px 0px -15% 0px",
      threshold: [0, 0.06],
    });
    els.forEach(([el, key]) => {
      elToKey.set(el, key);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  async function subscribe(planId) {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data?.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (e) {
      alert(e?.message || "Unable to start checkout");
    }
  }

  // Show overlay after delay or on first scroll
  useEffect(() => {
    let shown = false;
    const reveal = () => {
      if (!shown) {
        shown = true;
        setOverlayVisible(true);
        window.removeEventListener("scroll", onScroll, { passive: true });
      }
    };
    const onScroll = () => {
      if (window.scrollY > 0) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(reveal, 5000); // gentle delay approximating one hero loop
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* Full-bleed minimal hero (intro) using GIF */}
      <section
        className="relative isolate min-h-screen w-full overflow-hidden"
        style={{ height: "100dvh" }}
      >
        <Image
          src="/bardty-prodgif.gif"
          alt="Bardty hero"
          fill
          priority
          unoptimized
          className="select-none pointer-events-none object-cover"
        />
        {/* Branding overlay near bottom - left aligned, Helvetica Neue */}
        <div
          className={`absolute bottom-8 sm:bottom-10 left-4 sm:left-6 max-w-[min(92%,700px)] transition-all duration-700 ease-out ${
            overlayVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          <div
            className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              letterSpacing: "0.01em",
            }}
          >
            <h1 className="font-semibold tracking-tight text-[12px]">
              STREAM SHOP, SELL, NOW
            </h1>
          </div>
          <div className="mt-3 sm:mt-4">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-md border border-white/80 bg-transparent text-white px-4 py-2 text-sm sm:text-base backdrop-blur-[2px] hover:bg-white/10 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section
        id="about"
        ref={aboutRef}
        className={`relative mx-auto max-w-6xl px-4 sm:px-6 mt-0 pt-0 pb-14 transition-all duration-700 ease-out will-change-[opacity,transform] ${
          visible.about ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h2 className="mt-2 text-xl font-semibold mb-3">About Us</h2>
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
        <h2 className="text-xl font-semibold mb-3">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {pricingPlans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`group relative overflow-hidden rounded-2xl p-5 grid gap-4 transform transition-all duration-[900ms] ease-out
                ring-1 ring-inset ring-white/5 border border-white/10
                bg-gradient-to-br from-[#111111] to-[#000000]
                shadow-[0_12px_40px_rgba(0,0,0,0.28)]
                hover:ring-white/15 hover:border-white/20 hover:shadow-[0_16px_60px_rgba(0,0,0,0.35)]
                ${
                visible.pricing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ transitionDelay: `${idx * 220}ms` }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (plan.id === "free") window.location.href = "/signup?plan=free";
                  else subscribe(plan.id);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.classList.add("hovering");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.remove("hovering");
              }}
            >
              {/* metallic sheen overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  backgroundImage:
                    "radial-gradient(800px 260px at -10% -20%, rgba(255,255,255,0.08), rgba(255,255,255,0)), linear-gradient(120deg, rgba(255,255,255,0.10), rgba(255,255,255,0.0) 28%)",
                  mixBlendMode: "screen",
                }}
              />
              <div className="grid gap-1">
                <div className="text-sm uppercase tracking-wide text-foreground/70">{plan.name}</div>
                <div className="text-3xl font-semibold">
                  {plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`}
                  <span className="text-base font-normal text-foreground/60">/mo</span>
                </div>
                <div className="text-xs text-foreground/70">{plan.continuance}</div>
              </div>
              <ul className="grid gap-2 text-sm">
                {plan.features.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {plan.id === "free" ? (
                <a
                  href="/signup?plan=free"
                  className="inline-flex items-center justify-center rounded-md border border-white/35 text-white px-4 py-2 text-sm font-medium bg-transparent hover:bg-white/10 transition-colors"
                >
                  Sub now
                </a>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-white/35 text-white px-4 py-2 text-sm font-medium bg-transparent hover:bg-white/10 transition-colors"
                  onClick={() => subscribe(plan.id)}
                >
                  Sub now
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-foreground/60">Payments are securely handled by Stripe.</div>
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
