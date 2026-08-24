import { requireAdmin } from "@/lib/auth/dal";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * proxy.ts already blocks unauthenticated/non-admin requests to this whole
 * subtree at the edge; requireAdmin() here is deliberate defense-in-depth
 * (backend brief §9 — "not just hiding links"), not the primary gate. Split
 * into its own (protected) group, sibling to admin/login, so the login page
 * itself isn't wrapped by a check that would redirect back to itself.
 */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav email={profile.email} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
