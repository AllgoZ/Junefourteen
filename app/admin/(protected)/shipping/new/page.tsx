import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShippingZoneForm } from "@/components/admin/shipping-zone-form";

export const metadata = { title: "New Shipping Zone" };

export default function NewShippingZonePage() {
  return (
    <div>
      <Link
        href="/admin/shipping"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Shipping
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">New Shipping Zone</h1>
      <div className="mt-6">
        <ShippingZoneForm />
      </div>
    </div>
  );
}
