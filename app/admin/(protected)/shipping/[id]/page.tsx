import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShippingZoneForAdmin } from "@/lib/repositories/admin/shipping";
import { ShippingZoneForm } from "@/components/admin/shipping-zone-form";

export const metadata = { title: "Edit Shipping Zone" };

export default async function EditShippingZonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const zone = await getShippingZoneForAdmin(admin, id);
  if (!zone) notFound();

  return (
    <div>
      <Link
        href="/admin/shipping"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Shipping
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">{zone.name}</h1>
      <div className="mt-6">
        <ShippingZoneForm zone={zone} />
      </div>
    </div>
  );
}
