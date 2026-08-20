import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** For placement on the near-black Black Edit section — swaps text for legible light tones. */
  dark?: boolean;
  /** Grid cards hide the strike-through compare price; PDP/cart keep showing it. */
  showCompareAtPrice?: boolean;
}

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export function Price({
  price,
  compareAtPrice,
  size = "sm",
  className,
  dark = false,
  showCompareAtPrice = true,
}: PriceProps) {
  const onSale = showCompareAtPrice && compareAtPrice != null && compareAtPrice > price;

  return (
    <span className={cn("inline-flex items-baseline gap-2", SIZE_CLASSES[size], className)}>
      <span className={cn("font-medium tabular-nums", dark && "text-warm-white")}>
        {formatPrice(price)}
      </span>
      {onSale && (
        <span
          className={cn(
            "text-[0.85em] tabular-nums line-through",
            dark ? "text-warm-white/55" : "text-muted-foreground"
          )}
        >
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </span>
  );
}
