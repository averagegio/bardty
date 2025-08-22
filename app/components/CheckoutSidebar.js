"use client";

import { useEffect, useState } from "react";

export default function CheckoutSidebar({ open, plan, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setError("");
      setSuccess(false);
    }
  }, [open]);

  if (!open || !plan) return null;

  const priceLabel = plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!form.name || !form.email) {
        setError("Please complete all required fields.");
        setSubmitting(false);
        return;
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id, email: form.email, name: form.name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
      return;
    } catch (err) {
      setError(err?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 w-[420px] max-w-[90vw] bg-background border-l border-black/[.08] dark:border-white/[.145] shadow-xl grid grid-rows-[auto,1fr,auto]">
        <div className="p-4 border-b border-black/[.08] dark:border-white/[.145] flex items-center justify-between">
          <div className="grid">
            <div className="text-sm text-foreground/70">Plan</div>
            <div className="font-medium">{plan.name} — {priceLabel}/mo</div>
          </div>
          <button onClick={onClose} className="rounded-md border px-3 py-1 text-sm hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]">✕</button>
        </div>

        <form onSubmit={submit} className="p-4 overflow-y-auto grid gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-foreground/60">Cardholder name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-2 text-sm bg-background"
              placeholder="Jane Doe"
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-foreground/60">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-2 text-sm bg-background"
              placeholder="jane@example.com"
              required
            />
          </div>
          <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-3 text-xs bg-foreground/5">
            Payment is securely handled by Stripe Checkout.
          </div>

          {error ? <div className="text-xs text-red-600">{error}</div> : null}
          {success ? <div className="text-xs text-green-600">Payment successful. Your subscription is active.</div> : null}
        </form>

        <div className="p-4 border-t border-black/[.08] dark:border-white/[.145]">
          <button
            onClick={(e) => {
              const formEl = document.querySelector("aside form");
              if (formEl) formEl.requestSubmit();
            }}
            disabled={submitting}
            className="w-full rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? "Processing…" : `Pay ${priceLabel}/month`}
          </button>
          <div className="pt-2 text-[11px] text-foreground/60">Auto-renews monthly. Cancel anytime.</div>
        </div>
      </aside>
    </>
  );
}


