import { pricingPlans } from "@/lib/pricing";

export async function GET() {
  return Response.json({ plans: pricingPlans });
}


