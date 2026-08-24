import Link from "next/link";
import { Search, ImageOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllProductsForAdmin } from "@/lib/repositories/admin/products";
import { setProductActiveAction } from "@/app/admin/(protected)/products/actions";
import { formatPrice } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui/page-header";

export const metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const admin = createAdminClient();
  const products = await listAllProductsForAdmin(admin, q);

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"} in the catalog.`}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/products/new">New Product</Link>
          </Button>
        }
      />

      <form className="relative mt-5 max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input name="q" defaultValue={q} placeholder="Search by name…" className="pl-8" />
      </form>

      <div className="mt-4 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Collections</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/admin/products/${p.id}`} className="group flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, not worth a Cloudinary loader round trip
                        <img src={p.thumbnail} alt="" className="size-full object-cover" />
                      ) : (
                        <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <span className="font-medium text-foreground group-hover:underline">{p.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.category}</TableCell>
                <TableCell className="text-muted-foreground">{p.collectionNames.join(", ") || "—"}</TableCell>
                <TableCell className="tabular-nums">{formatPrice(p.price)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {!p.is_active && <Badge variant="outline">Inactive</Badge>}
                    {p.is_sold_out && <Badge variant="destructive">Sold Out</Badge>}
                    {p.is_new && <Badge>New</Badge>}
                    {p.is_best_seller && <Badge variant="secondary">Best Seller</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <form action={setProductActiveAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="isActive" value={(!p.is_active).toString()} />
                    <Button type="submit" variant="ghost" size="sm">
                      {p.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
