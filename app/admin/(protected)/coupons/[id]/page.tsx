import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCouponForAdmin } from "@/lib/repositories/admin/coupons";
import { CouponForm } from "@/components/admin/coupon-form";

export const metadata = { title: "Edit Coupon" };

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const coupon = await getCouponForAdmin(admin, id);
  if (!coupon) notFound();

  return (
    <div>
      <Link
        href="/admin/coupons"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Coupons
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">{coupon.code}</h1>
      <div className="mt-6">
        <CouponForm coupon={coupon} />
      </div>
    </div>
  );
}
