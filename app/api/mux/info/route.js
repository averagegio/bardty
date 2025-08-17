import { redis } from "@/lib/redis";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playbackId = searchParams.get("playback_id");
  if (!playbackId) {
    return Response.json({ error: "Missing playback_id" }, { status: 400 });
  }
  try {
    const data = await redis.hgetall(`mux:live:${playbackId}`);
    if (!data) return Response.json({ found: false });
    return Response.json({ found: true, info: data });
  } catch (e) {
    return Response.json({ found: false });
  }
}


