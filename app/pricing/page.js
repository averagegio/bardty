"use client";

import PricingCard from "../components/PricingCard";
import CheckoutSidebar from "../components/CheckoutSidebar";
import { Suspense, useEffect, useState } from "react";
import { pricingPlans } from "@/lib/pricing";
import { useSearchParams, useRouter } from "next/navigation";

export default function PricingPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [banner, setBanner] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleSelect(plan) {
    if (plan.id === "merchant" || plan.id === "enterprise") {
      setSelectedPlan(plan);
      setCheckoutOpen(true);
    }
  }

  useEffect(() => {
    const s = searchParams.get("checkout");
    if (s === "success") {
      setBanner({ type: "success", text: "Payment successful. Your subscription is now active." });
      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    } else if (s === "cancel") {
      setBanner({ type: "warning", text: "Checkout canceled. You can try again anytime." });
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, router]);

  return (
    <Suspense>
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-2xl sm:text-3xl font-semibold">Pricing</h1>
        <p className="text-foreground/70 text-sm">Simple monthly plans with continuance and room to grow.</p>
      </div>
      {banner && (
        <div className={`rounded-md p-3 text-sm ${banner.type === "success" ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20"}`}>
          {banner.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} onSelect={handleSelect} />
        ))}
      </div>
      <CheckoutSidebar open={checkoutOpen} plan={selectedPlan} onClose={() => setCheckoutOpen(false)} />
    </div>
    </Suspense>
  );
}


