"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import cloudinaryLoader from "@/lib/cloudinary/loader";
import { saveCollectionAction, type CollectionFormState } from "@/app/admin/(protected)/collections/actions";
import type { AdminCollectionRow } from "@/lib/repositories/admin/collections";

const INITIAL_STATE: CollectionFormState = {};

export function CollectionForm({ collection }: { collection?: AdminCollectionRow }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveCollectionAction, INITIAL_STATE);

  useEffect(() => {
    if (state.collectionId) {
      toast.success("Collection saved.");
      router.push("/admin/collections");
    }
  }, [state.collectionId, router]);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      {collection && <input type="hidden" name="id" value={collection.id} />}

      <AdminCard title="Basics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="collection-name">Name</Label>
            <Input id="collection-name" name="name" defaultValue={collection?.name} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="collection-slug">Slug</Label>
            <Input id="collection-slug" name="slug" defaultValue={collection?.slug} placeholder="auto-generated-from-name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="collection-tone">Placeholder Tone (0–1)</Label>
            <Input
              id="collection-tone"
              name="tone"
              type="number"
              min="0"
              max="1"
              step="0.05"
              defaultValue={collection?.tone ?? 0.5}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="collection-sort">Sort Order</Label>
            <Input id="collection-sort" name="sortOrder" type="number" defaultValue={collection?.sort_order ?? 0} />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <Label htmlFor="collection-description">Description</Label>
          <textarea
            id="collection-description"
            name="description"
            defaultValue={collection?.description}
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </AdminCard>

      <AdminCard title="Image">
        <div className="flex flex-col gap-4">
          {collection?.image_url && (
            <div className="relative aspect-[3/2] w-48 overflow-hidden rounded-lg border border-border">
              <Image loader={cloudinaryLoader} src={collection.image_url} alt="" fill sizes="200px" className="object-cover" />
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border p-4">
            <ImagePlus className="mb-1.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" strokeWidth={1.5} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="collection-image">{collection?.image_url ? "Replace Image" : "Image"}</Label>
              <input id="collection-image" name="image" type="file" accept="image/*" className="text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="collection-image-alt">Alt Text</Label>
              <Input id="collection-image-alt" name="imageAlt" defaultValue={collection?.image_alt ?? ""} className="w-56" />
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard>
        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={collection?.is_active ?? true}
            className="size-4 rounded border-input accent-foreground"
          />
          Active — visible on storefront
        </label>
      </AdminCard>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} size="lg" className="shadow-[var(--shadow-elevated)]">
          {pending ? "Saving…" : "Save Collection"}
        </Button>
      </div>
    </form>
  );
}
