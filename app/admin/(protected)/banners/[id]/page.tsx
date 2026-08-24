import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBannerForAdmin } from "@/lib/repositories/admin/banners";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata = { title: "Edit Banner" };

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const banner = await getBannerForAdmin(admin, id);
  if (!banner) notFound();

  return (
    <div>
      <Link
        href="/admin/banners"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Banners
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">{banner.headline || "Untitled Slide"}</h1>
      <div className="mt-6">
        <BannerForm banner={banner} />
      </div>
    </div>
  );
}
