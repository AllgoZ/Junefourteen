import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllProductsForAdmin } from "@/lib/repositories/admin/products";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ProductsTable } from "@/components/admin/products-table";

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

      <ProductsTable products={products} />
    </div>
  );
}
