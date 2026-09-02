export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export type SleeveOption = "Sleeveless" | "3/4 Sleeve" | "Full Sleeve" | "18\" Sleeve";

export type MeasurementUnit = "cm" | "in";

export interface CustomMeasurements {
  unit: MeasurementUnit;
  bust?: number;
  upperChest?: number;
  middleChest?: number;
  shoulder?: number;
  sleeveLength?: number;
  frontNeck?: number;
  backNeck?: number;
  topLength?: number;
  armRound?: number;
  waist?: number;
  hip?: number;
  pantLength?: number;
}

export interface ProductImage {
  id: string;
  alt: string;
  /** Real photography URL. Omitted while the catalog uses placeholders. */
  src?: string;
  /** 0–1 seed driving the placeholder's gradient tone, kept stable per image. */
  tone: number;
}

/**
 * One priced piece of a per-piece product (e.g. Top / Bottom / Dupatta of a
 * kurta set). A product with no pieces is a normal single-price product; a
 * product with pieces lets the customer tick any combination (≥1) and the
 * price is the sum of the ticked pieces.
 */
export interface ProductPiece {
  id: string;
  name: string;
  price: number;
  /** Ticked when the product page first loads (admin-controlled per piece). */
  defaultSelected: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  category: string;
  collectionSlugs: string[];
  tags: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isSoldOut?: boolean;
  sizes: Size[];
  sleeveOptions?: SleeveOption[];
  supportsCustomSize?: boolean;
  /** When present, the customer picks a subset (≥1); price = sum of picks. Absent ⇒ normal single-price product. */
  pieces?: ProductPiece[];
  /** Admin-uploaded size chart. When set, the "Size Guide" popup shows this image instead of the generic table. */
  sizeChartImage?: { src: string; alt: string };
  fabric: string;
  washCare: string[];
  shippingInfo: string;
  fitNotes: string;
}

export interface Collection {
  slug: string;
  name: string;
  description: string;
  tone: number;
  imageSrc?: string;
}

export interface Banner {
  id: string;
  alt: string;
  /** Horizontal/laptop image. */
  src?: string;
  objectPosition: string;
  /** Vertical/mobile image — falls back to `src` (with `mobileObjectPosition`) when absent. */
  mobileSrc?: string;
  mobileAlt: string;
  mobileObjectPosition: string;
  tone: number;
  /** The whole banner image links here — defaults to /shop with "Shop Now" when unset. */
  link?: { label: string; href: string };
}
