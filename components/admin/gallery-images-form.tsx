"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  saveHomepageGalleryImageAction,
  type HomepageGalleryFormState,
} from "@/app/admin/(protected)/collections/actions";
import type { AdminHomepageGalleryImageRow } from "@/lib/repositories/admin/homepage";

const INITIAL_STATE: HomepageGalleryFormState = {};

/** One independent upload form per tile — each tile saves on its own, mirroring ProductImagesManager's per-image upload flow. */
function GallerySlot({ image, index }: { image: AdminHomepageGalleryImageRow; index: number }) {
  const [state, action, pending] = useActionState(saveHomepageGalleryImageAction, INITIAL_STATE);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.success && !state.error) toast.success(`Tile ${index + 1} saved.`);
  }, [state.success, state.error, index]);

  return (
    <form action={action} className="flex flex-col gap-2.5 rounded-lg border border-border p-3">
      <input type="hidden" name="id" value={image.id} />

      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview ?? image.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <input
        name="image"
        type="file"
        accept="image/*"
        className="text-xs"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
        }}
      />

      <Input name="imageAlt" defaultValue={image.image_alt} placeholder="Alt text" className="h-8 text-xs" />

      {state.error && <p className="text-xs text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} size="sm" variant="outline">
        {pending ? "Saving…" : `Save Tile ${index + 1}`}
      </Button>
    </form>
  );
}

export function GalleryImagesForm({ images }: { images: AdminHomepageGalleryImageRow[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {images.map((image, index) => (
        <GallerySlot key={image.id} image={image} index={index} />
      ))}
    </div>
  );
}
