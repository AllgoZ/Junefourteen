import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface AdminInventoryRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  thumbnail: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
}

export async function listProductsForInventory(
  admin: SupabaseClient<Database>,
  search?: string
): Promise<AdminInventoryRow[]> {
  let query = admin
    .from("products")
    .select(
      `id, slug, name, category, stock_quantity, low_stock_threshold,
       product_images ( image_url, sort_order )`
    )
    .order("name", { ascending: true });

  if (search?.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query.overrideTypes<
    {
      id: string;
      slug: string;
      name: string;
      category: string;
      stock_quantity: number;
      low_stock_threshold: number;
      product_images: { image_url: string; sort_order: number }[];
    }[],
    { merge: false }
  >();

  if (error) throw new Error(`listProductsForInventory: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    thumbnail: [...row.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ?? null,
    stockQuantity: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
  }));
}

export async function updateProductStock(
  admin: SupabaseClient<Database>,
  id: string,
  stockQuantity: number
): Promise<void> {
  const { error } = await admin.from("products").update({ stock_quantity: stockQuantity }).eq("id", id);
  if (error) throw new Error(`updateProductStock: ${error.message}`);
}
