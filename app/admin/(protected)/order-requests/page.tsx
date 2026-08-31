import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { listOrderRequestsForAdmin } from "@/lib/repositories/admin/order-requests";
import { updateOrderRequestStatusAction } from "@/app/admin/(protected)/order-requests/actions";
import { PageHeader } from "@/components/admin/ui/page-header";
import { OrderRequestStatusBadge } from "@/components/admin/ui/status-badge";

export const metadata = { title: "Order Requests" };

const STATUSES = ["new", "contacted", "fulfilled", "cancelled"];

export default async function AdminOrderRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const admin = createAdminClient();
  const requests = await listOrderRequestsForAdmin(admin, { status });

  return (
    <div>
      <PageHeader
        title="Order Requests"
        description={`${requests.length} pre-order request${requests.length === 1 ? "" : "s"} for sold-out products.`}
      />

      <form className="mt-5 flex flex-wrap gap-3">
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
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Size / Qty</TableHead>
              <TableHead>Delivery Address</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-foreground">{r.product_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  <div>{r.customer_name}</div>
                  <div className="text-xs">{r.phone}</div>
                  {r.email && <div className="text-xs">{r.email}</div>}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.size} &times; {r.quantity}
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-muted-foreground" title={r.delivery_address}>
                  {r.delivery_address}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell>
                  <OrderRequestStatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-right">
                  <form action={updateOrderRequestStatusAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <select
                      name="status"
                      defaultValue={r.status}
                      className="rounded-lg border border-input bg-transparent px-2 py-1 text-xs text-foreground capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="ghost" size="sm">
                      Update
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No order requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
