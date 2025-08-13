// Simple Server-Sent Events (SSE) endpoint for demo live chat broadcast
// This is a naive in-memory broker suitable only for demos/dev

import { redis } from "@/lib/redis";

let clients = [];

export async function GET(request) {
  const encoder = new TextEncoder();
  let clientRef = null;

  const stream = new ReadableStream({
    start(controller) {
      const client = {
        send: (data) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)),
        close: () => controller.close(),
      };
      clientRef = client;
      clients.push(client);
      client.send({ type: "hello", ts: Date.now() });
      controller.enqueue(encoder.encode(`: connected\n\n`));

      const abort = () => {
        clients = clients.filter((c) => c !== client);
        try { controller.close(); } catch {}
      };
      request.signal.addEventListener("abort", abort);
    },
    cancel() {
      if (clientRef) {
        clients = clients.filter((c) => c !== clientRef);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const payload = { type: "message", ...body, ts: Date.now() };
  // persist to Redis list (trim last 200 messages)
  try {
    await redis.rpush("chat:live", JSON.stringify(payload));
    await redis.ltrim("chat:live", -200, -1);
  } catch {}
  clients.forEach((c) => c.send(payload));
  return Response.json({ ok: true });
}


