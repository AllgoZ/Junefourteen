import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { listCustomersForAdmin } from "@/lib/repositories/admin/customers";
import { PageHeader } from "@/components/admin/ui/page-header";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const admin = createAdminClient();
  const customers = await listCustomersForAdmin(admin);

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`Read-only — ${customers.length} account${customers.length === 1 ? "" : "s"}.`}
      />

      <div className="mt-5 rounded-xl border border-border bg-card shadow-[var(--shadow-subtle)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const initial = (c.fullName ?? c.email ?? "?").trim()[0]?.toUpperCase() ?? "?";
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-2.5 hover:underline">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                        {initial}
                      </span>
                      <span className="font-medium text-foreground">{c.fullName ?? "—"}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{c.orderCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                </TableRow>
              );
            })}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
