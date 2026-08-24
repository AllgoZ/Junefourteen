import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CollectionForm } from "@/components/admin/collection-form";

export const metadata = { title: "New Collection" };

export default function NewCollectionPage() {
  return (
    <div>
      <Link
        href="/admin/collections"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Collections
      </Link>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">New Collection</h1>
      <div className="mt-6">
        <CollectionForm />
      </div>
    </div>
  );
}
