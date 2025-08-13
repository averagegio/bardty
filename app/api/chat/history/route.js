import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const items = await redis.lrange("chat:live", -100, -1);
    const messages = items.map((s) => JSON.parse(s));
    return Response.json({ messages });
  } catch (e) {
    return Response.json({ messages: [] });
  }
}


