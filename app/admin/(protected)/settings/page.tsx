import { UserRound } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAllSocialLinksForAdmin } from "@/lib/repositories/admin/social-links";
import { getTaxSettingsForAdmin } from "@/lib/repositories/admin/tax";
import { ChangeEmailForm, ChangePasswordForm } from "@/components/admin/account-settings-forms";
import { SocialLinksForm } from "@/components/admin/social-links-form";
import { TaxSettingsForm } from "@/components/admin/tax-settings-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const profile = await getCurrentProfile();
  const initial = (profile?.full_name ?? profile?.email ?? "?").trim()[0]?.toUpperCase() ?? "?";
  const admin = createAdminClient();
  const [socialLinks, taxSettings] = await Promise.all([
    listAllSocialLinksForAdmin(admin),
    getTaxSettingsForAdmin(admin),
  ]);

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" />

      <div className="mt-6 flex flex-col gap-5">
        <AdminCard>
          <div className="flex items-center gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-base font-medium text-foreground">
              {initial}
            </span>
            <div className="min-w-0">
              {profile?.full_name && <p className="truncate text-sm font-medium text-foreground">{profile.full_name}</p>}
              <p className="truncate text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            <Badge variant="secondary" className="ml-auto shrink-0 capitalize">
              {profile?.role}
            </Badge>
          </div>
        </AdminCard>

        <AdminCard
          title="Change Email"
          description="Confirmation links are sent to both your old and new email — the change applies once you confirm from the new inbox."
        >
          <ChangeEmailForm currentEmail={profile?.email ?? ""} />
        </AdminCard>

        <AdminCard title="Change Password" description="Applies immediately — you'll stay signed in on this device.">
          <ChangePasswordForm />
        </AdminCard>

        <AdminCard
          title="Social Links"
          description="Shown as icons in the site footer and used for the Instagram grid on the homepage."
        >
          <SocialLinksForm links={socialLinks} />
        </AdminCard>

        <AdminCard title="Tax" description="A single store-wide rate, added on top of the order subtotal at checkout.">
          <TaxSettingsForm settings={taxSettings} />
        </AdminCard>

        <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-border p-4">
          <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" strokeWidth={1.75} />
          <p className="text-sm text-muted-foreground">
            Shipping zones and coupons are managed under their own sections in the sidebar. The payment
            provider (Razorpay) isn&apos;t configurable here yet — its keys are set via environment variables.
          </p>
        </div>
      </div>
    </div>
  );
}
