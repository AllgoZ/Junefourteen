import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminCard } from "@/components/admin/ui/card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/ui/status-badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerForAdmin } from "@/lib/repositories/admin/customers";
import { listOrdersForCustomer } from "@/lib/repositories/admin/orders";
import { listAddressesForUser } from "@/lib/repositories/addresses";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Customer Detail" };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const customer = await getCustomerForAdmin(admin, id);
  if (!customer) notFound();

  const [addresses, orders] = await Promise.all([
    listAddressesForUser(admin, id),
    listOrdersForCustomer(admin, id),
  ]);

  const initial = (customer.fullName ?? customer.email ?? "?").trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/customers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Customers
      </Link>

      <div className="flex items-center gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-base font-medium text-foreground">
          {initial}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-medium tracking-tight text-foreground">
            {customer.fullName ?? "—"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {customer.email ?? "—"} · {customer.phone ?? "—"}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Joined{" "}
        {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </p>

      <AdminCard title="Addresses" className="mt-6">
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved addresses.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 rounded-lg border border-border p-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {a.full_name}
                    {a.is_default && (
                      <Badge variant="secondary" className="ml-2">
                        Default
                      </Badge>
                    )}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {a.address_line_1}
                    {a.address_line_2 ? `, ${a.address_line_2}` : ""}, {a.city}, {a.state} {a.postal_code}
                  </p>
                  <p className="text-muted-foreground">{a.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-foreground">Orders</h2>
        <div className="mt-3 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
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
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.payment_status} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
