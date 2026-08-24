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
  /**
   * Optional overlay copy — all opt-in. hero-section.tsx only renders the
   * text block when `headline` is non-empty, so a banner with none of this
   * filled in keeps today's exact text-free look.
   */
  badgeText?: string;
  headline?: string;
  subheading?: string;
  offerBadgeText?: string;
  /** Primary CTA. */
  link?: { label: string; href: string };
  secondaryLink?: { label: string; href: string };
}
