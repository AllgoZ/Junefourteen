import Link from "next/link";
import { Truck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { listShippingZonesForAdmin } from "@/lib/repositories/admin/shipping";
import { setShippingZoneActiveAction, deleteShippingZoneAction } from "@/app/admin/(protected)/shipping/actions";
import { PageHeader } from "@/components/admin/ui/page-header";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Shipping" };

export default async function AdminShippingPage() {
  const admin = createAdminClient();
  const zones = await listShippingZonesForAdmin(admin);

  return (
    <div>
      <PageHeader
        title="Shipping"
        description={`${zones.length} zone${zones.length === 1 ? "" : "s"} — replaces the old fixed rate table.`}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/shipping/new">New Zone</Link>
          </Button>
        }
      />

      <div className="mt-4 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone</TableHead>
              <TableHead>States</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((z) => (
              <TableRow key={z.id}>
                <TableCell>
                  <Link href={`/admin/shipping/${z.id}`} className="flex items-center gap-2.5 font-medium text-foreground hover:underline">
                    <Truck className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {z.name}
                    {z.is_default && <Badge variant="secondary">Default</Badge>}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {z.states.length === 0 ? "—" : z.states.length > 3 ? `${z.states.length} states` : z.states.join(", ")}
                </TableCell>
                <TableCell className="tabular-nums">{formatPrice(z.rate)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {z.eta_min_days}–{z.eta_max_days} days
                </TableCell>
                <TableCell>
                  {z.is_active ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <form action={setShippingZoneActiveAction}>
                      <input type="hidden" name="id" value={z.id} />
                      <input type="hidden" name="isActive" value={(!z.is_active).toString()} />
                      <Button type="submit" variant="ghost" size="sm">
                        {z.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </form>
                    <form action={deleteShippingZoneAction}>
                      <input type="hidden" name="id" value={z.id} />
                      <Button type="submit" variant="ghost" size="sm" className="hover:text-destructive">
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {zones.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No shipping zones yet — checkout is using the built-in fallback rates.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
