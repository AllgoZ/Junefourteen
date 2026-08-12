"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useWishlist } from "@/components/providers/wishlist-provider";

export function WishlistSummary() {
  const { count } = useWishlist();

  if (count === 0) {
    return (
      <EmptyState
        title="Your wishlist is waiting."
        description="Save pieces you love and they'll appear here."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        }
        className="items-start px-0 py-4 text-left"
      />
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 py-4 text-left">
      <p className="text-sm font-medium text-foreground">
        {count} {count === 1 ? "piece" : "pieces"} saved
      </p>
      <Button asChild size="sm">
        <Link href="/wishlist">View Wishlist</Link>
      </Button>
    </div>
  );
}
