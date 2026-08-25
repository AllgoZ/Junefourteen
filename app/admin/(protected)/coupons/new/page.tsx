import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/admin/coupon-form";

export const metadata = { title: "New Coupon" };

export default function NewCouponPage() {
  return (
    <div>
      <Link
        href="/admin/coupons"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Coupons
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">New Coupon</h1>
      <div className="mt-6">
        <CouponForm />
      </div>
    </div>
  );
}
