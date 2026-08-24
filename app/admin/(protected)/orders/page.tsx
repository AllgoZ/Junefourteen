import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { listOrdersForAdmin } from "@/lib/repositories/admin/orders";
import { formatPrice } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui/page-header";
import { OrderStatusBadge } from "@/components/admin/ui/status-badge";

export const metadata = { title: "Orders" };

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const admin = createAdminClient();
  const orders = await listOrdersForAdmin(admin, { search: q, status });

  return (
    <div>
      <PageHeader title="Orders" description={`${orders.length} order${orders.length === 1 ? "" : "s"}.`} />

      <form className="mt-5 flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input name="q" defaultValue={q} placeholder="Search by order # or email…" className="pl-8" />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm text-foreground"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </form>

      <div className="mt-4 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-foreground hover:underline">
                    {order.order_number}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell className="tabular-nums">{formatPrice(order.total)}</TableCell>
                <TableCell className="text-muted-foreground capitalize">{order.payment_status}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
