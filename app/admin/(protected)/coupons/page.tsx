import Link from "next/link";
import { Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllCouponsForAdmin } from "@/lib/repositories/admin/coupons";
import { setCouponActiveAction, deleteCouponAction } from "@/app/admin/(protected)/coupons/actions";
import { PageHeader } from "@/components/admin/ui/page-header";

export const metadata = { title: "Coupons" };

function formatDiscount(type: string, value: number): string {
  return type === "percentage" ? `${value}% off` : `₹${value} off`;
}

export default async function AdminCouponsPage() {
  const admin = createAdminClient();
  const coupons = await listAllCouponsForAdmin(admin);
  // Server Component — runs once per request, not subject to the
  // re-render/memoization concern react-hooks/purity exists for; a
  // wall-clock read here is exactly what "is this expired right now" needs.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <div>
      <PageHeader
        title="Coupons"
        description={`${coupons.length} coupon${coupons.length === 1 ? "" : "s"}.`}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/coupons/new">New Coupon</Link>
          </Button>
        }
      />

      <div className="mt-4 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => {
              const expired = c.expires_at ? new Date(c.expires_at).getTime() < now : false;
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/admin/coupons/${c.id}`} className="flex items-center gap-2.5 font-medium text-foreground hover:underline">
                      <Ticket className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {c.code}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDiscount(c.discount_type, c.discount_value)}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {c.times_used}
                    {c.usage_limit != null ? ` / ${c.usage_limit}` : ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.expires_at
                      ? new Date(c.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {!c.is_active && <Badge variant="outline">Inactive</Badge>}
                      {expired && <Badge variant="destructive">Expired</Badge>}
                      {c.is_active && !expired && <Badge variant="secondary">Active</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <form action={setCouponActiveAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="isActive" value={(!c.is_active).toString()} />
                        <Button type="submit" variant="ghost" size="sm">
                          {c.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                      <form action={deleteCouponAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button type="submit" variant="ghost" size="sm" className="hover:text-destructive">
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No coupons yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
