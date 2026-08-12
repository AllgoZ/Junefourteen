import type { ProductFilters, SortOption } from "@/lib/services/products";
import type { Size, SleeveOption } from "@/types/product";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

export const PRICE_BANDS = [
  { key: "under-2500", label: "Under ₹2,500", min: undefined, max: 2500 },
  { key: "2500-5000", label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { key: "above-5000", label: "Above ₹5,000", min: 5000, max: undefined },
] as const;

export type PriceBandKey = (typeof PRICE_BANDS)[number]["key"];

/** Raw shape App Router hands us for `searchParams` — every value is a string or absent. */
export interface ShopSearchParams {
  collection?: string;
  category?: string;
  size?: string;
  sleeve?: string;
  price?: string;
  inStock?: string;
  sort?: string;
  q?: string;
}

function splitParam(value?: string): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function parseShopSearchParams(params: ShopSearchParams): ProductFilters {
  const band = PRICE_BANDS.find((b) => b.key === params.price);
  const sort = SORT_OPTIONS.find((s) => s.value === params.sort)?.value;

  return {
    collectionSlugs: splitParam(params.collection),
    categories: splitParam(params.category),
    sizes: splitParam(params.size) as Size[],
    sleeveOptions: splitParam(params.sleeve) as SleeveOption[],
    priceMin: band?.min,
    priceMax: band?.max,
    inStockOnly: params.inStock === "1",
    sort: sort ?? "featured",
    query: params.q,
  };
}

export function countActiveFilters(params: ShopSearchParams): number {
  return (
    splitParam(params.category).length +
    splitParam(params.size).length +
    splitParam(params.sleeve).length +
    splitParam(params.collection).length +
    (params.price ? 1 : 0) +
    (params.inStock === "1" ? 1 : 0)
  );
}
