import Mux from "@mux/mux-node";

// Create a Mux Live Stream and return stream key and playback id
export async function POST() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    return new Response("Missing Mux credentials", { status: 500 });
  }

  const mux = new Mux({ tokenId, tokenSecret });

  const live = await mux.liveStreams.create({
    playback_policy: ["public"],
    new_asset_settings: { playback_policy: ["public"] },
    reconnect_window: 60,
    reduced_latency: true,
  });

  const { id, stream_key, playback_ids } = live;
  const playbackId = playback_ids?.[0]?.id;

  return Response.json({ id, stream_key, playback_id: playbackId });
}


