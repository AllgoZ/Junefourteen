import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  className?: string;
  emptyMessage?: string;
  /** For placement on the near-black Black Edit section. */
  dark?: boolean;
}

export function ProductGrid({ products, className, emptyMessage, dark = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found."
        description={
          emptyMessage ?? "Try adjusting your filters, or browse the full collection instead."
        }
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-2 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12 xl:grid-cols-4",
        className
      )}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} dark={dark} />
      ))}
    </div>
  );
}
