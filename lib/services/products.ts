import { unstable_cache } from "next/cache";
import { listActiveProducts, getActiveProductBySlug } from "@/lib/repositories/products";
import { listActiveCollections, getActiveCollectionBySlug } from "@/lib/repositories/collections";
import { dbProductToProduct } from "@/lib/mappers/product";
import { dbCollectionToCollection } from "@/lib/mappers/collection";
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
 * Cached base fetchers — the Supabase seam every function below reads
 * through. Tagged broadly ("products"/"collections") rather than per-row:
 * the catalog is small (18 products, 5 collections) so over-invalidating on
 * any single admin edit costs nothing, and it keeps revalidation simple to
 * reason about. getProductBySlug/getCollectionBySlug additionally tag their
 * own entry (`product:<slug>`/`collection:<slug>`) for a narrower
 * revalidateTag when only that one row changed.
 */
const getCachedProducts = unstable_cache(
  async () => (await listActiveProducts()).map(dbProductToProduct),
  ["products"],
  { tags: ["products"], revalidate: 3600 }
);

const getCachedCollections = unstable_cache(
  async () => (await listActiveCollections()).map(dbCollectionToCollection),
  ["collections"],
  { tags: ["collections"], revalidate: 3600 }
);

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let result = await getCachedProducts();

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
  const cached = unstable_cache(
    async (s: string) => {
      const row = await getActiveProductBySlug(s);
      return row ? dbProductToProduct(row) : null;
    },
    ["product-by-slug"],
    { tags: ["products", `product:${slug}`], revalidate: 3600 }
  );
  const product = await cached(slug);
  return product ?? undefined;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getCachedProducts();
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
  return getCachedCollections();
}

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  const cached = unstable_cache(
    async (s: string) => {
      const row = await getActiveCollectionBySlug(s);
      return row ? dbCollectionToCollection(row) : null;
    },
    ["collection-by-slug"],
    { tags: ["collections", `collection:${slug}`], revalidate: 3600 }
  );
  const collection = await cached(slug);
  return collection ?? undefined;
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const products = await getCachedProducts();
  return products.filter((p) => p.isNew).slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const products = await getCachedProducts();
  return products.filter((p) => p.isBestSeller).slice(0, limit);
}

export async function getAllCategories(): Promise<string[]> {
  const products = await getCachedProducts();
  return Array.from(new Set(products.map((p) => p.category)));
}

export async function getAllSleeveOptions(): Promise<SleeveOption[]> {
  const products = await getCachedProducts();
  const set = new Set<SleeveOption>();
  products.forEach((p) => p.sleeveOptions?.forEach((s) => set.add(s)));
  return Array.from(set);
}

export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  if (!query.trim()) return [];
  return getProducts({ query, sort: "featured" }).then((r) => r.slice(0, limit));
}
