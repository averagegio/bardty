"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

const MOCK_POSTS = Array.from({ length: 12 }).map((_, idx) => ({
  id: `post-${idx + 1}`,
  creator: idx % 2 === 0 ? "@shopgal" : "@techguru",
  title: idx % 2 === 0 ? "Spring haul live recap" : "Unboxing the latest earbuds",
  product: idx % 2 === 0 ? "Floral Dress" : "Wireless Earbuds",
  price: 29 + (idx % 5) * 5,
}));

export default function FeedPage() {
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const containerRef = useRef(null);
  const [adding, setAdding] = useState(null);

  async function addToCart(sku) {
    try {
      setAdding(sku);
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, qty: 1 }),
      });
    } finally {
      setAdding(null);
    }
  }

  const toggleLike = (postId) => {
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const posts = useMemo(() => MOCK_POSTS, []);

  return (
    <div ref={containerRef} className="grid gap-4">
      <h1 className="text-xl font-semibold">Interactive Feed</h1>
      <p className="text-sm text-foreground/70">Swipe/scroll through shoppable posts.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => {
          const isLiked = likedPostIds.has(post.id);
          return (
            <article key={post.id} className="rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden">
              <div className="aspect-[4/5] relative bg-foreground/5">
                <Image src="/next.svg" alt="Post media" fill className="object-contain p-10 dark:invert" />
              </div>
              <div className="p-4 grid gap-2">
                <div className="text-sm text-foreground/70">{post.creator}</div>
                <div className="font-medium">{post.title}</div>
                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm">
                    <span className="font-medium">{post.product}</span>
                    <span className="text-foreground/60"> · $ {post.price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => toggleLike(post.id)}
                    aria-pressed={isLiked}
                    className={`rounded-md px-3 py-1 text-xs border transition-colors ${
                      isLiked
                        ? "bg-foreground text-background border-transparent"
                        : "border-black/[.08] dark:border-white/[.145] hover:bg-foreground/5"
                    }`}
                  >
                    {isLiked ? "Liked" : "Like"}
                  </button>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => addToCart(post.product)}
                    disabled={adding === post.product}
                    className="w-full rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-2 text-sm font-medium hover:bg-foreground/5 disabled:opacity-60"
                  >
                    {adding === post.product ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}


