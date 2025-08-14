import Link from "next/link";
import Image from "next/image";

export default function MarketplacePage() {
  return (
    <div className="grid gap-10">
      <section className="grid gap-2">
        <h1 className="text-2xl sm:text-3xl font-semibold">Marketplace</h1>
        <p className="text-foreground/70 max-w-prose">
          Browse trending products and discover items featured in our live streams.
        </p>
        <div className="flex gap-3 pt-2">
          <Link href="/live" className="inline-flex items-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">
            Watch Live
          </Link>
          <Link href="/feed" className="inline-flex items-center rounded-md border border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm font-medium hover:bg-foreground/5">
            Explore Feed
          </Link>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Trending Now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden">
              <div className="aspect-[4/5] relative">
                <Image src="/vercel.svg" alt="Product" fill className="object-contain p-8 dark:invert" />
              </div>
              <div className="p-3 text-sm">
                <div className="font-medium">Mock Product {i}</div>
                <div className="text-foreground/70">$ {(19 + i).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


