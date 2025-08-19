import { AccessToken } from "livekit-server-sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identity, name, roomName = "bardty-live" } = body || {};

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitHost = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitHost) {
      return Response.json(
        {
          error: "Missing LiveKit configuration",
          hasApiKey: Boolean(apiKey),
          hasApiSecret: Boolean(apiSecret),
          hasUrl: Boolean(livekitHost),
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const userIdentity = identity || `user_${Math.random().toString(36).slice(2, 10)}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userIdentity,
      name: name || userIdentity,
    });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return Response.json(
      { token, url: livekitHost, identity: userIdentity, room: roomName },
      { headers: corsHeaders }
    );
  } catch (e) {
    const message = e?.message || "Failed to create LiveKit token";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}


