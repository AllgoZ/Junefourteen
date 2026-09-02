import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/product/price";
import { WishlistButton } from "@/components/product/wishlist-button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
  /** For placement on the near-black Black Edit section. */
  dark?: boolean;
}

export function ProductCard({ product, priority, className, dark = false }: ProductCardProps) {
  const [primary, secondary] = product.images;

  return (
    <div className={cn("group relative flex flex-col", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden rounded-sm bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ProductImage
          image={primary}
          alt={product.name}
          priority={priority}
          aspect="gridCard"
          className={cn(
            "transition-all duration-500 ease-out group-hover:scale-[1.03]",
            secondary && "md:group-hover:opacity-0"
          )}
        />
        {secondary && (
          <ProductImage
            image={secondary}
            alt=""
            aspect="gridCard"
            className="absolute inset-0 hidden opacity-0 transition-all duration-500 ease-out group-hover:scale-[1.03] md:block md:group-hover:opacity-100"
          />
        )}

        {(product.isNew || product.compareAtPrice) && !product.isSoldOut && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/30 to-transparent" />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          {product.isSoldOut ? (
            <span className="rounded-sm bg-background/45 px-1 py-0.5 text-[9px] font-medium tracking-[0.12em] text-destructive uppercase">
              Sold Out
            </span>
          ) : product.isNew ? (
            <span className="text-[10px] font-medium tracking-[0.14em] text-white uppercase">New</span>
          ) : product.compareAtPrice ? (
            <span className="text-[10px] font-medium tracking-[0.14em] text-white uppercase">Sale</span>
          ) : (
            <span />
          )}
          <span className="pointer-events-auto">
            <WishlistButton
              item={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: primary,
                isSoldOut: product.isSoldOut,
              }}
            />
          </span>
        </div>
      </Link>

      <Link href={`/product/${product.slug}`} className="mt-2.5 flex flex-col gap-1">
        <h3 className={cn("text-xs", dark ? "text-warm-white/80" : "text-muted-foreground")}>
          {product.name}
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} dark={dark} />
      </Link>
    </div>
  );
}
