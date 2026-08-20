"use client";

import Link from "next/link";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/product/price";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useCart } from "@/components/providers/cart-provider";
import type { Product } from "@/types/product";

export function WishlistGrid({ products }: { products: Product[] }) {
  const { items, removeItem } = useWishlist();
  const { addItem, openCart } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is waiting."
        description="Save pieces you love and they'll appear here."
        action={
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        }
      />
    );
  }

  const moveToBag = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.isSoldOut) return;

    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        size: product.sizes[0],
        sleeve: product.sleeveOptions?.[0],
      },
      1
    );
    removeItem(productId);
    toast.success(`${product.name} moved to your bag.`, {
      action: { label: "View Bag", onClick: openCart },
    });
  };

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12 xl:grid-cols-4">
      {items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return (
          <div key={item.productId} className="flex flex-col">
            <div className="relative">
              <Link href={`/product/${item.slug}`} className="block overflow-hidden rounded-sm bg-muted">
                <ProductImage
                  image={item.image}
                  alt={item.name}
                  className={item.isSoldOut ? "grayscale opacity-70" : undefined}
                />
              </Link>
              <button
                type="button"
                aria-label={`Remove ${item.name} from wishlist`}
                onClick={() => removeItem(item.productId)}
                className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-background/70 hover:bg-background"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
              {item.isSoldOut && (
                <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-sm bg-background/90 px-2 py-1 text-[10px] font-medium tracking-[0.14em] text-foreground uppercase">
                  Sold Out
                </span>
              )}
            </div>

            <Link href={`/product/${item.slug}`} className="mt-3 flex flex-col gap-1">
              <h3 className="text-sm text-foreground">{item.name}</h3>
              <Price price={item.price} compareAtPrice={item.compareAtPrice} />
            </Link>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={item.isSoldOut || !product}
              onClick={() => moveToBag(item.productId)}
              className="mt-3"
            >
              Move to Bag
            </Button>
          </div>
        );
      })}
    </div>
  );
}
