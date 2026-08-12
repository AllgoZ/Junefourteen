import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export function Price({ price, compareAtPrice, size = "sm", className }: PriceProps) {
  const onSale = compareAtPrice != null && compareAtPrice > price;

  return (
    <span className={cn("inline-flex items-baseline gap-2", SIZE_CLASSES[size], className)}>
      <span className={cn("font-medium tabular-nums", onSale && "text-destructive")}>
        {formatPrice(price)}
      </span>
      {onSale && (
        <span className="text-muted-foreground text-[0.85em] tabular-nums line-through">
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </span>
  );
}
