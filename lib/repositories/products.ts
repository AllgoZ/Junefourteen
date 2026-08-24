import { createAnonClient } from "@/lib/supabase/anon";

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  tags: string[];
  is_new: boolean;
  is_best_seller: boolean;
  is_sold_out: boolean;
  custom_size_enabled: boolean;
  fabric: string;
  wash_care: string[];
  shipping_info: string;
  fit_notes: string;
  product_images: { id: string; image_url: string; alt: string; tone: number; sort_order: number }[];
  product_sizes: { size: string; sort_order: number }[];
  product_sleeve_options: { sleeve_option: string; sort_order: number }[];
  product_collections: { sort_order: number; collections: { slug: string } | null }[];
}

// One nested select — images/sizes/sleeves/collection-membership all arrive
// in the same round trip, so listing products never N+1s per row.
const PRODUCT_SELECT = `
  id, slug, name, description, short_description, price, compare_at_price,
  category, tags, is_new, is_best_seller, is_sold_out, custom_size_enabled,
  fabric, wash_care, shipping_info, fit_notes,
  product_images ( id, image_url, alt, tone, sort_order ),
  product_sizes ( size, sort_order ),
  product_sleeve_options ( sleeve_option, sort_order ),
  product_collections ( sort_order, collections ( slug ) )
`;

/**
 * All active products. Filtering/sorting (by collection, size, price band,
 * etc.) happens in lib/services/products.ts, in memory, same as it always
 * has against the mock array — the catalog is ~18 rows, so a single fetch
 * plus JS filtering is both simpler and cheaper than encoding every
 * ProductFilters predicate as PostgREST embedded-resource filter syntax. If
 * the catalog grows to a size where that stops being true, push the filters
 * that matter most (collection, category, price) down into this query first.
 */
export async function listActiveProducts(): Promise<ProductRow[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .overrideTypes<ProductRow[], { merge: false }>();

  if (error) throw new Error(`listActiveProducts: ${error.message}`);
  return data;
}

export async function getActiveProductBySlug(slug: string): Promise<ProductRow | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
    .overrideTypes<ProductRow, { merge: false }>();

  if (error) throw new Error(`getActiveProductBySlug: ${error.message}`);
  return data;
}

export interface OrderPricingProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  isSoldOut: boolean;
  isActive: boolean;
  imageUrl: string | null;
}

/**
 * Authoritative pricing lookup for order creation — never trust a client-
 * supplied price (backend brief §21). Deliberately does not filter on
 * is_active so checkout can tell "sold out" apart from "no longer exists"
 * and reject with a clear reason either way.
 */
export async function getProductsForPricing(productIds: string[]): Promise<Map<string, OrderPricingProduct>> {
  if (productIds.length === 0) return new Map();

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, is_sold_out, is_active, product_images ( image_url, sort_order )")
    .in("id", productIds)
    .overrideTypes<
      { id: string; name: string; slug: string; price: number; is_sold_out: boolean; is_active: boolean; product_images: { image_url: string; sort_order: number }[] }[],
      { merge: false }
    >();

  if (error) throw new Error(`getProductsForPricing: ${error.message}`);

  return new Map(
    data.map((row) => {
      const image = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
      return [
        row.id,
        {
          id: row.id,
          name: row.name,
          slug: row.slug,
          price: row.price,
          isSoldOut: row.is_sold_out,
          isActive: row.is_active,
          imageUrl: image?.image_url ?? null,
        },
      ];
    })
  );
}
