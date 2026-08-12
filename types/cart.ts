import type { CustomMeasurements, ProductImage, Size, SleeveOption } from "@/types/product";

export interface CartItem {
  /** Unique per line — same product/size/sleeve combo merges, custom-size lines never do. */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image?: ProductImage;
  price: number;
  compareAtPrice?: number;
  size?: Size;
  sleeve?: SleeveOption;
  customMeasurements?: CustomMeasurements;
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
