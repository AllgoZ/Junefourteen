"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { ShippingEstimator } from "@/components/cart/shipping-estimator";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartContent({
  onCheckout,
  className,
  variant = "drawer",
}: {
  onCheckout?: () => void;
  className?: string;
  /** "drawer" scrolls internally within a fixed-height Sheet; "page" flows with the page. */
  variant?: "drawer" | "page";
}) {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is waiting."
        description="Pieces you add will show up here, ready when you are."
        action={
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        }
        className="flex-1"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        variant === "drawer" ? "overflow-hidden" : "gap-6",
        className
      )}
    >
      <div
        className={cn(
          "divide-y divide-border",
          variant === "drawer" ? "flex-1 overflow-y-auto px-4 sm:px-6" : "border-b border-border"
        )}
      >
        {items.map((item) => (
          <CartLineItem key={item.lineId} item={item} />
        ))}
      </div>

      <div
        className={cn(
          "space-y-4",
          variant === "drawer" ? "border-t border-border px-4 py-4 sm:px-6" : ""
        )}
      >
        <ShippingEstimator />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground tabular-nums">
            {formatPrice(subtotal)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and taxes calculated at checkout.
        </p>

        <Button asChild size="lg" className="w-full" onClick={onCheckout}>
          <Link href="/checkout">Checkout</Link>
        </Button>
      </div>
    </div>
  );
}
