import { cookies } from "next/headers";
import { redis } from "@/lib/redis";
import { randomUUID } from "crypto";

function getCartKey() {
  const store = cookies();
  let id = store.get("cartId")?.value;
  if (!id) {
    id = randomUUID();
    store.set("cartId", id, { maxAge: 60 * 60 * 24 * 30, httpOnly: false, sameSite: "lax" });
  }
  return `cart:${id}`;
}

export async function GET() {
  const key = getCartKey();
  const items = (await redis.hgetall(key)) || {};
  const cart = Object.entries(items).map(([sku, qty]) => ({ sku, qty: Number(qty) }));
  return Response.json({ cart });
}

export async function POST(request) {
  const key = getCartKey();
  const { sku, qty = 1 } = await request.json();
  const current = Number((await redis.hget(key, sku)) || 0);
  await redis.hset(key, { [sku]: current + Number(qty) });
  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const key = getCartKey();
  const { sku } = await request.json();
  await redis.hdel(key, sku);
  return Response.json({ ok: true });
}


