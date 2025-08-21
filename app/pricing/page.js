import PricingCard from "../components/PricingCard";
import { pricingPlans } from "@/lib/pricing";

export default function PricingPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-2xl sm:text-3xl font-semibold">Pricing</h1>
        <p className="text-foreground/70 text-sm">Simple monthly plans with continuance and room to grow.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}


