"use client";

import { useActionState, useTransition } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard } from "@/components/admin/ui/card";
import cloudinaryLoader from "@/lib/cloudinary/loader";
import {
  deleteProductImageAction,
  reorderProductImagesAction,
  uploadProductImageAction,
  type ImageUploadState,
} from "@/app/admin/(protected)/products/actions";
import type { AdminProductImage } from "@/lib/repositories/admin/products";

const INITIAL_STATE: ImageUploadState = {};

export function ProductImagesManager({ productId, images }: { productId: string; images: AdminProductImage[] }) {
  const uploadAction = uploadProductImageAction.bind(null, productId);
  const [state, action, pending] = useActionState(uploadAction, INITIAL_STATE);
  const [isReordering, startReorder] = useTransition();

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    startReorder(() => reorderProductImagesAction(productId, next.map((img) => img.id)));
  }

  return (
    <AdminCard title="Images" description="First image is the storefront's primary photo. Reorder with the arrows.">
      <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg border border-border">
              <div className="relative aspect-[4/5] bg-muted">
                <Image
                  loader={cloudinaryLoader}
                  src={image.imageUrl}
                  alt={image.alt}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-foreground/85 px-2 py-0.5 text-[10px] font-medium text-background">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-border bg-card p-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0 || isReordering}
                  onClick={() => move(index, -1)}
                  aria-label="Move earlier"
                >
                  <ArrowLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === images.length - 1 || isReordering}
                  onClick={() => move(index, 1)}
                  aria-label="Move later"
                >
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteProductImageAction(image.id, image.cloudinaryPublicId, productId)}
                  aria-label="Delete image"
                  className="hover:text-destructive"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={action} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border p-4">
        <ImagePlus className="mb-1.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" strokeWidth={1.5} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image-file">Upload image</Label>
          <input id="image-file" name="file" type="file" accept="image/*" required className="text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image-alt">Alt text</Label>
          <Input id="image-alt" name="alt" className="w-56" />
        </div>
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Uploading…" : "Upload"}
        </Button>
        {state.error && <p className="w-full text-xs text-destructive">{state.error}</p>}
      </form>
      </div>
    </AdminCard>
  );
}
