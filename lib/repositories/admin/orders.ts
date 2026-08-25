import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminOrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type AdminOrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export interface AdminOrderFilters {
  search?: string;
  status?: string;
}

export async function listOrdersForAdmin(
  admin: SupabaseClient<Database>,
  filters: AdminOrderFilters = {}
): Promise<AdminOrderRow[]> {
  let query = admin.from("orders").select("*").order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(`order_number.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listOrdersForAdmin: ${error.message}`);
  return data;
}

export async function getOrderForAdmin(
  admin: SupabaseClient<Database>,
  id: string
): Promise<{ order: AdminOrderRow; items: AdminOrderItemRow[] } | null> {
  const { data: order, error: orderError } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
  if (orderError) throw new Error(`getOrderForAdmin: ${orderError.message}`);
  if (!order) return null;

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });
  if (itemsError) throw new Error(`getOrderForAdmin items: ${itemsError.message}`);

  return { order, items: items ?? [] };
}

export async function listOrdersForCustomer(
  admin: SupabaseClient<Database>,
  userId: string
): Promise<AdminOrderRow[]> {
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listOrdersForCustomer: ${error.message}`);
  return data;
}

const VALID_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export async function updateOrderStatusForAdmin(
  admin: SupabaseClient<Database>,
  id: string,
  updates: { status?: string; paymentStatus?: string }
): Promise<void> {
  const patch: { status?: string; payment_status?: string } = {};
  if (updates.status && VALID_STATUSES.includes(updates.status)) patch.status = updates.status;
  if (updates.paymentStatus && VALID_PAYMENT_STATUSES.includes(updates.paymentStatus)) {
    patch.payment_status = updates.paymentStatus;
  }
  if (Object.keys(patch).length === 0) return;

  const { error } = await admin.from("orders").update(patch).eq("id", id);
  if (error) throw new Error(`updateOrderStatusForAdmin: ${error.message}`);
}

export async function updateOrderTrackingForAdmin(
  admin: SupabaseClient<Database>,
  id: string,
  updates: { trackingNumber: string | null; trackingUrl: string | null }
): Promise<void> {
  const { error } = await admin
    .from("orders")
    .update({ tracking_number: updates.trackingNumber, tracking_url: updates.trackingUrl })
    .eq("id", id);
  if (error) throw new Error(`updateOrderTrackingForAdmin: ${error.message}`);
}
