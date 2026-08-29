import { createAdminClient } from "@/lib/supabase/admin";
import { listLegalPagesForAdmin } from "@/lib/repositories/admin/legal";
import { LegalPageForm } from "@/components/admin/legal-page-form";
import { AdminCard } from "@/components/admin/ui/card";
import { PageHeader } from "@/components/admin/ui/page-header";

export const metadata = { title: "Legal Pages" };

export default async function AdminLegalPage() {
  const admin = createAdminClient();
  const pages = await listLegalPagesForAdmin(admin);
  const privacy = pages.find((p) => p.slug === "privacy");
  const terms = pages.find((p) => p.slug === "terms");

  return (
    <div className="max-w-3xl">
      <PageHeader title="Legal Pages" description="Edit the content shown on the public /privacy and /terms pages." />

      <div className="mt-4 flex flex-col gap-5">
        {privacy && (
          <AdminCard title="Privacy Policy">
            <LegalPageForm page={privacy} slug="privacy" />
          </AdminCard>
        )}
        {terms && (
          <AdminCard title="Terms of Service">
            <LegalPageForm page={terms} slug="terms" />
          </AdminCard>
        )}
      </div>
    </div>
  );
}
