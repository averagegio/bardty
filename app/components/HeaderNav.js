"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeaderNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="absolute top-0 z-50 w-full bg-transparent border-transparent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/bardtylogo.jpg"
              alt="Bardty logo"
              width={28}
              height={28}
              className="rounded-sm select-none pointer-events-none"
            />
            <span className="font-semibold text-lg tracking-tight">bardty</span>
          </Link>
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="rounded-md border px-3 py-1 text-sm hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]"
          >
            ☰
          </button>
        </div>
      </header>
      {open ? (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30"
            aria-hidden
          />
          <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[90vw] bg-background border-l border-black/[.08] dark:border-white/[.145] shadow-lg flex flex-col">
            <div className="p-3 border-b border-black/[.08] dark:border-white/[.145] flex items-center justify-between">
              <div className="font-medium text-sm">Menu</div>
              <button
                onClick={() => setOpen(false)}
                className="text-sm opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
            <nav className="p-3 grid gap-2 text-sm">
              <a href="#about" onClick={() => setOpen(false)} className="hover:underline">
                About
              </a>
              <a href="#pricing" onClick={() => setOpen(false)} className="hover:underline">
                Pricing
              </a>
              <a href="#store" onClick={() => setOpen(false)} className="hover:underline">
                Store
              </a>
              <Link href="/live" onClick={() => setOpen(false)} className="hover:underline">
                Live
              </Link>
              <Link href="/feed" onClick={() => setOpen(false)} className="hover:underline">
                Feed
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="hover:underline">
                Login
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="hover:underline">
                Signup
              </Link>
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}

