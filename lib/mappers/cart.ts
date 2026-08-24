import type { CartItemWithProduct } from "@/lib/repositories/cart";
import type { CartItem } from "@/types/cart";
import type { CustomMeasurements, Size, SleeveOption } from "@/types/product";

export function dbCartItemToCartItem(row: CartItemWithProduct): CartItem | null {
  const product = row.products;
  if (!product) return null;

  const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];

  return {
    lineId: row.id,
    productId: row.product_id,
    slug: product.slug,
    name: product.name,
    image: image ? { id: image.id, alt: image.alt, src: image.image_url, tone: image.tone } : undefined,
    price: product.price,
    compareAtPrice: product.compare_at_price ?? undefined,
    size: (row.size as Size | null) ?? undefined,
    sleeve: (row.sleeve_option as SleeveOption | null) ?? undefined,
    customMeasurements: (row.custom_measurements as unknown as CustomMeasurements | null) ?? undefined,
    quantity: row.quantity,
  };
}
