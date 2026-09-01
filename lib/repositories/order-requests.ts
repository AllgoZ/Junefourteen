import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type OrderRequestRow = Database["public"]["Tables"]["order_requests"]["Row"];

export interface NewOrderRequest {
  productId: string | null;
  productName: string;
  productSlug: string;
  userId: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  size: string;
  quantity: number;
  deliveryAddress: string;
}

/** Insert always goes through the admin (service-role) client — no client-writable RLS policy exists for this table by design (see 0018's migration). */
export async function createOrderRequest(admin: SupabaseClient<Database>, input: NewOrderRequest): Promise<void> {
  const { error } = await admin.from("order_requests").insert({
    product_id: input.productId,
    product_name: input.productName,
    product_slug: input.productSlug,
    user_id: input.userId,
    customer_name: input.customerName,
    phone: input.phone,
    email: input.email,
    size: input.size,
    quantity: input.quantity,
    delivery_address: input.deliveryAddress,
  });
  if (error) throw new Error(`createOrderRequest: ${error.message}`);
}

/** Caller-scoped: pass the cookie-bound server client so RLS (order_requests_owner_select, 0019) enforces "own rows only". */
export async function listOrderRequestsForUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<OrderRequestRow[]> {
  const { data, error } = await supabase
    .from("order_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listOrderRequestsForUser: ${error.message}`);
  return data;
}

/** Same RLS-scoped client — used by the PDP to show "Requested" instead of "Request to Order" on a fresh page load, not just for the current browser session. */
export async function hasOrderRequestForProduct(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("order_requests")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`hasOrderRequestForProduct: ${error.message}`);
  return data != null;
}
