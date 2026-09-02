import type { CustomMeasurements, ProductImage, Size, SleeveOption } from "@/types/product";

export interface CartItem {
  /** Unique per line — same product/size/sleeve/pieces combo merges, custom-size lines never do. */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image?: ProductImage;
  /** For a per-piece product this is the sum of the selected pieces' prices. */
  price: number;
  compareAtPrice?: number;
  size?: Size;
  sleeve?: SleeveOption;
  customMeasurements?: CustomMeasurements;
  /** Per-piece products only: the product_pieces ids the customer selected. */
  selectedPieceIds?: string[];
  /** Display snapshot of those pieces, e.g. "Top + Bottom + Dupatta". */
  selectedPieces?: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: ProductImage;
  isSoldOut?: boolean;
  addedAt: number;
}
