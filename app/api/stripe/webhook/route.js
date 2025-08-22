import Stripe from "stripe";
import { redis } from "@/lib/redis";

export const runtime = "nodejs"; // ensure Node.js runtime for raw body

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !stripeSecret) return new Response("Missing Stripe secrets", { status: 500 });

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = session.customer_details?.email || session.customer_email;
        const planPriceId = session?.line_items?.data?.[0]?.price?.id || null;
        if (email) {
          await redis.hset(`sub:${email}`, {
            status: "active",
            plan_price: planPriceId || "unknown",
            updatedAt: String(Date.now()),
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const email = sub?.customer_email; // may be null; depends on expand
        if (email) {
          await redis.hset(`sub:${email}`, {
            status: "canceled",
            updatedAt: String(Date.now()),
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    // Swallow errors to keep webhook 2xx if non-critical
  }

  return new Response("ok", { status: 200 });
}

export const config = { api: { bodyParser: false } };


