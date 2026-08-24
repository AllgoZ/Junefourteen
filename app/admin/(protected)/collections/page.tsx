import Link from "next/link";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllCollectionsForAdmin } from "@/lib/repositories/admin/collections";
import { setCollectionActiveAction } from "@/app/admin/(protected)/collections/actions";
import { PageHeader } from "@/components/admin/ui/page-header";

export const metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const admin = createAdminClient();
  const collections = await listAllCollectionsForAdmin(admin);

  return (
    <div>
      <PageHeader
        title="Collections"
        description={`${collections.length} collection${collections.length === 1 ? "" : "s"}.`}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/collections/new">New Collection</Link>
          </Button>
        }
      />

      <div className="mt-4 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/admin/collections/${c.id}`} className="flex items-center gap-2.5 font-medium text-foreground hover:underline">
                    <Layers className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell>
                  {c.is_active ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <form action={setCollectionActiveAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="isActive" value={(!c.is_active).toString()} />
                    <Button type="submit" variant="ghost" size="sm">
                      {c.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {collections.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No collections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
