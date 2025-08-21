"use client";

import PricingCard from "../components/PricingCard";
import CheckoutSidebar from "../components/CheckoutSidebar";
import { useState } from "react";
import { pricingPlans } from "@/lib/pricing";

export default function PricingPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  function handleSelect(plan) {
    if (plan.id === "merchant" || plan.id === "enterprise") {
      setSelectedPlan(plan);
      setCheckoutOpen(true);
    }
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-2xl sm:text-3xl font-semibold">Pricing</h1>
        <p className="text-foreground/70 text-sm">Simple monthly plans with continuance and room to grow.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} onSelect={handleSelect} />
        ))}
      </div>
      <CheckoutSidebar open={checkoutOpen} plan={selectedPlan} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}


