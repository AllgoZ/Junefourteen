import { getCollections, getProducts } from "@/lib/services/products";
import type { Collection, Product } from "@/types/product";

export interface SearchResults {
  products: Product[];
  collections: Collection[];
}

export async function search(query: string, productLimit = 8): Promise<SearchResults> {
  const q = query.trim().toLowerCase();
  if (!q) return { products: [], collections: [] };

  const [products, allCollections] = await Promise.all([
    getProducts({ query: q }).then((r) => r.slice(0, productLimit)),
    getCollections(),
  ]);

  const matchedCollections = allCollections.filter(
    (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );

  return { products, collections: matchedCollections };
}
