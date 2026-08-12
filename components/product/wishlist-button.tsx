"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/components/providers/wishlist-provider";
import type { WishlistItem } from "@/types/cart";

interface WishlistButtonProps {
  item: Omit<WishlistItem, "addedAt">;
  variant?: "overlay" | "detail";
  className?: string;
}

export function WishlistButton({ item, variant = "overlay", className }: WishlistButtonProps) {
  const { isWishlisted, toggleItem } = useWishlist();
  const active = isWishlisted(item.productId);
  const [pulsing, setPulsing] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!active) {
          setPulsing(true);
          setTimeout(() => setPulsing(false), 300);
        }
        toggleItem({ ...item, addedAt: Date.now() });
      }}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors",
        variant === "overlay" &&
          "size-9 bg-background/70 hover:bg-background focus-visible:bg-background",
        variant === "detail" && "size-11 border border-border hover:bg-muted",
        className
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-transform",
          active ? "fill-foreground text-foreground" : "text-foreground",
          pulsing && "scale-125"
        )}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </button>
  );
}
