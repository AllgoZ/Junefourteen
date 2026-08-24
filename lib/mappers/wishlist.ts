import type { WishlistItemWithProduct } from "@/lib/repositories/wishlist";
import type { WishlistItem } from "@/types/cart";

export function dbWishlistItemToWishlistItem(row: WishlistItemWithProduct): WishlistItem | null {
  const product = row.products;
  if (!product) return null;

  const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];

  return {
    productId: row.product_id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compare_at_price ?? undefined,
    image: image ? { id: image.id, alt: image.alt, src: image.image_url, tone: image.tone } : undefined,
    isSoldOut: product.is_sold_out || undefined,
    addedAt: new Date(row.created_at).getTime(),
  };
}
