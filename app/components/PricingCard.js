"use client";

export default function PricingCard({ plan }) {
  const priceLabel = plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`;
  return (
    <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-5 grid gap-4">
      <div className="grid gap-1">
        <div className="text-sm uppercase tracking-wide text-foreground/70">{plan.name}</div>
        <div className="text-3xl font-semibold">{priceLabel}<span className="text-base font-normal text-foreground/60">/mo</span></div>
        <div className="text-xs text-foreground/70">{plan.continuance}</div>
      </div>
      <ul className="grid gap-2 text-sm">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href={plan.cta.href}
        className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        {plan.cta.label}
      </a>
    </div>
  );
}


