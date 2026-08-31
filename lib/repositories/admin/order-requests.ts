import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminOrderRequestRow = Database["public"]["Tables"]["order_requests"]["Row"];

export async function listOrderRequestsForAdmin(
  admin: SupabaseClient<Database>,
  filters: { status?: string } = {}
): Promise<AdminOrderRequestRow[]> {
  let query = admin.from("order_requests").select("*").order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(`listOrderRequestsForAdmin: ${error.message}`);
  return data;
}

export async function updateOrderRequestStatusForAdmin(
  admin: SupabaseClient<Database>,
  id: string,
  status: string
): Promise<void> {
  const { error } = await admin.from("order_requests").update({ status }).eq("id", id);
  if (error) throw new Error(`updateOrderRequestStatusForAdmin: ${error.message}`);
}
