import { createAdminClient } from "@/lib/supabase/admin";
import { getAboutPageContentForAdmin } from "@/lib/repositories/admin/about";
import { AboutPageForm } from "@/components/admin/about-page-form";
import { PageHeader } from "@/components/admin/ui/page-header";

export const metadata = { title: "About Page" };

export default async function AdminAboutPage() {
  const admin = createAdminClient();
  const content = await getAboutPageContentForAdmin(admin);

  return (
    <div className="max-w-3xl">
      <PageHeader title="About Page" description="Edit the text and images shown on the public /about page." />
      <div className="mt-4">
        <AboutPageForm content={content} />
      </div>
    </div>
  );
}
