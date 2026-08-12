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
}

export function ProductCard({ product, priority, className }: ProductCardProps) {
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
          className={cn(
            "transition-opacity duration-500",
            secondary && "md:group-hover:opacity-0",
            product.isSoldOut && "grayscale opacity-70"
          )}
        />
        {secondary && (
          <ProductImage
            image={secondary}
            alt=""
            className={cn(
              "absolute inset-0 hidden opacity-0 transition-opacity duration-500 md:block md:group-hover:opacity-100",
              product.isSoldOut && "grayscale opacity-70"
            )}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          {product.isNew ? (
            <span className="rounded-sm bg-foreground px-2 py-1 text-[10px] font-medium tracking-[0.12em] text-background uppercase">
              New
            </span>
          ) : product.compareAtPrice ? (
            <span className="rounded-sm bg-background px-2 py-1 text-[10px] font-medium tracking-[0.12em] text-foreground uppercase">
              Sale
            </span>
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

        {product.isSoldOut && (
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-sm bg-background/90 px-2 py-1 text-[10px] font-medium tracking-[0.14em] text-foreground uppercase">
            Sold Out
          </span>
        )}
      </Link>

      <Link href={`/product/${product.slug}`} className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm text-foreground">{product.name}</h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
      </Link>
    </div>
  );
}
