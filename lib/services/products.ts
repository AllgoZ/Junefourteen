import { products } from "@/lib/mock-data/products";
import { collections } from "@/lib/mock-data/collections";
import type { Collection, Product, Size, SleeveOption } from "@/types/product";

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";

export interface ProductFilters {
  collectionSlugs?: string[];
  categories?: string[];
  sizes?: Size[];
  sleeveOptions?: SleeveOption[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  sort?: SortOption;
  query?: string;
}

/**
 * Every export here is async even though the mock data is synchronous — this
 * is the seam that gets swapped for real Supabase calls later without any UI
 * changes.
 */

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let result = [...products];

  if (filters.collectionSlugs?.length) {
    result = result.filter((p) =>
      p.collectionSlugs.some((c) => filters.collectionSlugs!.includes(c))
    );
  }
  if (filters.categories?.length) {
    result = result.filter((p) => filters.categories!.includes(p.category));
  }
  if (filters.sizes?.length) {
    result = result.filter((p) => filters.sizes!.some((s) => p.sizes.includes(s)));
  }
  if (filters.sleeveOptions?.length) {
    result = result.filter((p) =>
      p.sleeveOptions?.some((s) => filters.sleeveOptions!.includes(s))
    );
  }
  if (filters.priceMin != null) {
    result = result.filter((p) => p.price >= filters.priceMin!);
  }
  if (filters.priceMax != null) {
    result = result.filter((p) => p.price <= filters.priceMax!);
  }
  if (filters.inStockOnly) {
    result = result.filter((p) => !p.isSoldOut);
  }
  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (filters.sort) {
    case "newest":
      result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "best-selling":
      result.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
      break;
    case "featured":
    default:
      break;
  }

  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.collectionSlugs.some((c) => product.collectionSlugs.includes(c)))
    )
    .slice(0, limit);
}

export async function getCollections(): Promise<Collection[]> {
  return collections;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  return collections.find((c) => c.slug === slug);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return products.filter((p) => p.isNew).slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return products.filter((p) => p.isBestSeller).slice(0, limit);
}

export async function getAllCategories(): Promise<string[]> {
  return Array.from(new Set(products.map((p) => p.category)));
}

export async function getAllSleeveOptions(): Promise<SleeveOption[]> {
  const set = new Set<SleeveOption>();
  products.forEach((p) => p.sleeveOptions?.forEach((s) => set.add(s)));
  return Array.from(set);
}

export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  if (!query.trim()) return [];
  return getProducts({ query, sort: "featured" }).then((r) => r.slice(0, limit));
}
