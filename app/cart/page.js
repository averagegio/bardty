"use client";

import { useEffect, useState } from "react";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/cart");
    const data = await res.json().catch(() => ({ cart: [] }));
    setItems(Array.isArray(data.cart) ? data.cart : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function removeItem(sku) {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku }),
    });
    await load();
  }

  const total = items.reduce((sum, i) => sum + i.qty * 20, 0); // mock price

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">Your Cart</h1>
      {loading ? (
        <div className="text-sm text-foreground/70">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-foreground/70">Your cart is empty.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.sku} className="flex items-center justify-between rounded-md border border-black/[.08] dark:border-white/[.145] px-4 py-3">
              <div className="text-sm">
                <div className="font-medium">{item.sku}</div>
                <div className="text-foreground/70">Qty: {item.qty}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm">$ {(item.qty * 20).toFixed(2)}</div>
                <button onClick={() => removeItem(item.sku)} className="rounded-md border px-3 py-1 text-xs hover:bg-foreground/5 border-black/[.08] dark:border-white/[.145]">Remove</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <div className="font-medium">Total</div>
            <div>$ {total.toFixed(2)}</div>
          </div>
          <button className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">Checkout</button>
        </div>
      )}
    </div>
  );
}


