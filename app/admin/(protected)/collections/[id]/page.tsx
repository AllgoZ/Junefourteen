import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCollectionForAdmin } from "@/lib/repositories/admin/collections";
import { CollectionForm } from "@/components/admin/collection-form";

export const metadata = { title: "Edit Collection" };

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const collection = await getCollectionForAdmin(admin, id);
  if (!collection) notFound();

  return (
    <div>
      <Link
        href="/admin/collections"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Collections
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">{collection.name}</h1>
      <div className="mt-6">
        <CollectionForm collection={collection} />
      </div>
    </div>
  );
}
