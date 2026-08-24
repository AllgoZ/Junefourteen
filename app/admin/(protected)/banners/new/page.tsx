import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata = { title: "New Banner" };

export default function NewBannerPage() {
  return (
    <div>
      <Link
        href="/admin/banners"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Banners
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">New Banner</h1>
      <div className="mt-6">
        <BannerForm />
      </div>
    </div>
  );
}
