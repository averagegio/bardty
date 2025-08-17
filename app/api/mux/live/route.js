import Mux from "@mux/mux-node";
import { redis } from "@/lib/redis";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Optional GET for health check (does not reveal secrets)
export async function GET() {
  const tokenId = process.env.MUX_TOKEN_ID_OVERRIDE || process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET_OVERRIDE || process.env.MUX_TOKEN_SECRET;
  const hasId = Boolean(tokenId);
  const hasSecret = Boolean(tokenSecret);
  return Response.json(
    { ok: hasId && hasSecret, requires: ["POST"], hasId, hasSecret },
    { headers: corsHeaders }
  );
}

// Create a Mux Live Stream and return stream key and playback id
export async function POST() {
  const tokenId = process.env.MUX_TOKEN_ID_OVERRIDE || process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET_OVERRIDE || process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    return Response.json(
      { error: "Missing Mux credentials" },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const { video } = new Mux({ tokenId, tokenSecret });
    const live = await video.liveStreams.create({
      playback_policy: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
      reconnect_window: 60,
      reduced_latency: true,
    });

    const { id, stream_key, playback_ids } = live;
    const playbackId = playback_ids?.[0]?.id;
    if (!playbackId) {
      return Response.json(
        { error: "No playback_id returned from Mux" },
        { status: 502, headers: corsHeaders }
      );
    }
    // Persist minimal details so the client can fetch ingest info after redirect
    try {
      await redis.hset(`mux:live:${playbackId}`, {
        id,
        stream_key,
        playback_id: playbackId,
        createdAt: String(Date.now()),
      });
      await redis.hset(`mux:live:latest`, { playback_id: playbackId });
    } catch {}
    return Response.json(
      { id, stream_key, playback_id: playbackId },
      { headers: corsHeaders }
    );
  } catch (e) {
    const message = e?.message || "Mux create live stream failed";
    const code = e?.code || e?.statusCode || 500;
    return Response.json(
      { error: message, code },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}


