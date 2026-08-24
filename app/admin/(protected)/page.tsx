import Link from "next/link";
import { ShoppingBag, Clock, Wallet, Package } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardMetrics } from "@/lib/repositories/admin/dashboard";
import { formatPrice } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatCard } from "@/components/admin/ui/stat-card";
import { OrderStatusBadge } from "@/components/admin/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const admin = createAdminClient();
  const metrics = await getDashboardMetrics(admin);

  return (
    <div>
      <PageHeader title="Dashboard" description="A quick read on orders and catalog health." />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Orders" value={String(metrics.totalOrders)} icon={ShoppingBag} />
        <StatCard
          label="Awaiting Action"
          value={String(metrics.ordersAwaitingAction)}
          icon={Clock}
          tone={metrics.ordersAwaitingAction > 0 ? "warn" : "default"}
        />
        <StatCard label="Revenue (Paid)" value={formatPrice(metrics.revenue)} icon={Wallet} />
        <StatCard label="Active Products" value={`${metrics.activeProductCount} / ${metrics.productCount}`} icon={Package} />
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium text-foreground">Recent Orders</h2>

        {metrics.recentOrders.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-foreground hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.email}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice(order.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
