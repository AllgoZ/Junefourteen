import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface AdminCustomerRow {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  orderCount: number;
}

export async function listCustomersForAdmin(admin: SupabaseClient<Database>): Promise<AdminCustomerRow[]> {
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, email, full_name, phone, created_at, role")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listCustomersForAdmin: ${error.message}`);

  const { data: orders, error: ordersError } = await admin.from("orders").select("user_id");
  if (ordersError) throw new Error(`listCustomersForAdmin orders: ${ordersError.message}`);

  const orderCounts = new Map<string, number>();
  for (const order of orders) {
    if (!order.user_id) continue;
    orderCounts.set(order.user_id, (orderCounts.get(order.user_id) ?? 0) + 1);
  }

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    phone: p.phone,
    createdAt: p.created_at,
    orderCount: orderCounts.get(p.id) ?? 0,
  }));
}

export interface AdminCustomerDetail {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
}

export async function getCustomerForAdmin(
  admin: SupabaseClient<Database>,
  id: string
): Promise<AdminCustomerDetail | null> {
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, full_name, phone, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getCustomerForAdmin: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    createdAt: data.created_at,
  };
}
