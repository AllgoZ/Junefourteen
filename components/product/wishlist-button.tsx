"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
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
  const [pulseKey, setPulseKey] = useState(0);

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!active) setPulseKey((k) => k + 1);
        toggleItem({ ...item, addedAt: Date.now() });
      }}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors",
        variant === "overlay" && "size-9",
        variant === "detail" && "size-11 border border-border hover:bg-muted",
        className
      )}
    >
      <motion.span
        key={pulseKey}
        initial={pulseKey === 0 ? false : { scale: 1 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <Heart
          className={cn(
            "size-4",
            active ? "fill-foreground text-foreground" : "text-foreground",
            variant === "overlay" && "drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </motion.span>
    </motion.button>
  );
}
