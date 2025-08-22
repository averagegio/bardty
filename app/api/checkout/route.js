import Stripe from "stripe";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { plan, email } = body || {};
  if (plan !== "merchant" && plan !== "enterprise") {
    return Response.json({ error: "Unsupported plan" }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceMap = {
    merchant: process.env.STRIPE_PRICE_MERCHANT, // recurring price id
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE, // recurring price id
  };
  const priceId = priceMap[plan];

  if (!secret || !priceId) {
    return Response.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

  try {
    const origin = request.headers.get("origin") || request.headers.get("referer") || "";
    const success_url = `${origin?.replace(/\/?$/, "")}\/pricing?checkout=success`;
    const cancel_url = `${origin?.replace(/\/?$/, "")}\/pricing?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url,
      cancel_url,
    });

    return Response.json({ id: session.id, url: session.url });
  } catch (e) {
    return Response.json({ error: e?.message || "Stripe Checkout failed" }, { status: 500 });
  }
}


