import { cookies } from "next/headers";
import { redis } from "@/lib/redis";
import { randomUUID } from "crypto";

async function getCartKey() {
  const store = await cookies();
  let id = store.get("cartId")?.value;
  if (!id) {
    id = randomUUID();
    store.set("cartId", id, { maxAge: 60 * 60 * 24 * 30, httpOnly: false, sameSite: "lax" });
  }
  return `cart:${id}`;
}

const memoryCarts = new Map();

export async function GET() {
  const key = await getCartKey();
  let items = {};
  try {
    items = (await redis.hgetall(key)) || {};
  } catch {
    items = memoryCarts.get(key) || {};
  }
  const cart = Object.entries(items).map(([sku, qty]) => ({ sku, qty: Number(qty) }));
  return Response.json({ cart });
}

export async function POST(request) {
  const key = await getCartKey();
  const { sku, qty = 1 } = await request.json();
  try {
    const current = Number((await redis.hget(key, sku)) || 0);
    await redis.hset(key, { [sku]: current + Number(qty) });
  } catch {
    const existing = memoryCarts.get(key) || {};
    const current = Number(existing[sku] || 0);
    existing[sku] = current + Number(qty);
    memoryCarts.set(key, existing);
  }
  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const key = await getCartKey();
  const { sku } = await request.json();
  try {
    await redis.hdel(key, sku);
  } catch {
    const existing = memoryCarts.get(key) || {};
    delete existing[sku];
    memoryCarts.set(key, existing);
  }
  return Response.json({ ok: true });
}


