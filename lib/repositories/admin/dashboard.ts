import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface DashboardMetrics {
  totalOrders: number;
  ordersAwaitingAction: number;
  revenue: number;
  productCount: number;
  activeProductCount: number;
  soldOutProductCount: number;
  recentOrders: { id: string; orderNumber: string; email: string; total: number; status: string; createdAt: string }[];
}

/** A handful of small aggregate queries, run in parallel — kept simple per brief §10.1 ("do not overbuild analytics"). */
export async function getDashboardMetrics(admin: SupabaseClient<Database>): Promise<DashboardMetrics> {
  const [ordersCount, awaitingCount, products, recentOrders, paidOrders] = await Promise.all([
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
    admin.from("products").select("is_active, is_sold_out"),
    admin
      .from("orders")
      .select("id, order_number, email, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    admin.from("orders").select("total").eq("payment_status", "paid"),
  ]);

  const productRows = products.data ?? [];
  const revenue = (paidOrders.data ?? []).reduce((sum, o) => sum + o.total, 0);

  return {
    totalOrders: ordersCount.count ?? 0,
    ordersAwaitingAction: awaitingCount.count ?? 0,
    revenue,
    productCount: productRows.length,
    activeProductCount: productRows.filter((p) => p.is_active).length,
    soldOutProductCount: productRows.filter((p) => p.is_sold_out).length,
    recentOrders: (recentOrders.data ?? []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      email: o.email,
      total: o.total,
      status: o.status,
      createdAt: o.created_at,
    })),
  };
}
