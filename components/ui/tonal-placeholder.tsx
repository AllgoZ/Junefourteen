import type { LucideIcon } from "lucide-react";
import { Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

export const ASPECT_CLASSES = {
  portrait: "aspect-[4/5]", // fashion photography ratio — used for all product imagery
  square: "aspect-square",
  wide: "aspect-[4/3]",
  cinematic: "aspect-[16/10]",
  tall: "aspect-[4/5]",
  /** Slightly more elongated than `portrait` — product-grid cards only (ProductCard), so the shared `portrait` ratio backing PDP gallery/cart/wishlist/search stays unchanged. */
  gridCard: "aspect-[3/4]",
} as const;

interface TonalPlaceholderProps {
  /** 0–1 seed driving the gradient's lightness so the same subject renders consistently. */
  tone: number;
  aspect?: keyof typeof ASPECT_CLASSES;
  icon?: LucideIcon;
  alt: string;
  className?: string;
  /** Set when overlaid text already conveys the content, so this doesn't get announced redundantly. */
  decorative?: boolean;
}

/**
 * Grayscale-gradient stand-in used everywhere real photography isn't
 * available yet — product images, hero/editorial imagery, social grid. Swap
 * for real photography by rendering next/image instead once assets exist.
 */
export function TonalPlaceholder({
  tone,
  aspect = "portrait",
  icon: Icon = Shirt,
  alt,
  className,
  decorative = false,
}: TonalPlaceholderProps) {
  const l1 = 90 - tone * 40;
  const l2 = l1 - 9;

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden",
        ASPECT_CLASSES[aspect],
        className
      )}
      style={{
        backgroundImage: `linear-gradient(150deg, oklch(${l1}% 0.002 95) 0%, oklch(${l2}% 0.002 95) 100%)`,
      }}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": alt })}
    >
      <Icon className="size-[18%] opacity-[0.12] text-foreground" strokeWidth={1} aria-hidden="true" />
    </div>
  );
}
