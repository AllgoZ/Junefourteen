import type { CartItemWithProduct } from "@/lib/repositories/cart";
import type { CartItem } from "@/types/cart";
import type { CustomMeasurements, Size, SleeveOption } from "@/types/product";

export function dbCartItemToCartItem(row: CartItemWithProduct): CartItem | null {
  const product = row.products;
  if (!product) return null;

  const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];

  // Per-piece product: recompute price + label from the live piece prices so
  // the authenticated cart is always self-healing (same principle as checkout
  // never trusting a client-supplied price).
  const rawPieceIds = Array.isArray(row.selected_piece_ids)
    ? (row.selected_piece_ids as unknown[]).map(String)
    : [];
  const selectedPieces = rawPieceIds.length
    ? [...product.product_pieces].sort((a, b) => a.sort_order - b.sort_order).filter((p) => rawPieceIds.includes(p.id))
    : [];

  const price = selectedPieces.length
    ? selectedPieces.reduce((sum, p) => sum + p.price, 0)
    : product.price;

  return {
    lineId: row.id,
    productId: row.product_id,
    slug: product.slug,
    name: product.name,
    image: image ? { id: image.id, alt: image.alt, src: image.image_url, tone: image.tone } : undefined,
    price,
    compareAtPrice: selectedPieces.length ? undefined : product.compare_at_price ?? undefined,
    size: (row.size as Size | null) ?? undefined,
    sleeve: (row.sleeve_option as SleeveOption | null) ?? undefined,
    customMeasurements: (row.custom_measurements as unknown as CustomMeasurements | null) ?? undefined,
    selectedPieceIds: selectedPieces.length ? selectedPieces.map((p) => p.id) : undefined,
    selectedPieces: selectedPieces.length ? selectedPieces.map((p) => p.name).join(" + ") : undefined,
    quantity: row.quantity,
  };
}
