"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  saveOfferPopupAction,
  type OfferPopupFormState,
} from "@/app/admin/(protected)/banners/offer-popup-actions";
import type { AdminOfferPopupRow } from "@/lib/repositories/admin/offer-popup";

const INITIAL_STATE: OfferPopupFormState = {};

/**
 * Plain <img> for the preview, not next/image: the source can be a
 * client-only blob: object URL for a not-yet-uploaded file (same reasoning
 * as CampaignBannerForm).
 */
export function OfferPopupForm({ popup }: { popup: AdminOfferPopupRow }) {
  const [state, action, pending] = useActionState(saveOfferPopupAction, INITIAL_STATE);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.success && !state.error) toast.success("Offer popup saved.");
  }, [state.success, state.error]);

  const currentSrc = preview ?? popup.image_url;

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:w-40">
          {currentSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentSrc} alt="" className="absolute inset-0 h-full w-full object-contain" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-muted-foreground">
              No image — popup is off
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="offer-popup-image">{popup.image_url ? "Replace Image" : "Image"}</Label>
            <input
              id="offer-popup-image"
              name="image"
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: a portrait JPG/PNG around 900×1200px. Bake everything — offer text, terms,
              and the call-to-action — into the image itself; the popup shows no text of its own.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="offer-popup-alt">Alt Text</Label>
            <Input
              id="offer-popup-alt"
              name="imageAlt"
              defaultValue={popup.image_alt}
              placeholder="Short description of the offer (for screen readers)"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="offer-popup-link">Link URL</Label>
              <Input
                id="offer-popup-link"
                name="linkHref"
                defaultValue={popup.link_href ?? ""}
                placeholder="/shop?sale=... — leave blank to just close on click"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="offer-popup-width">Popup Width (px)</Label>
              <Input
                id="offer-popup-width"
                name="displayWidthPx"
                type="number"
                min={240}
                max={900}
                defaultValue={popup.display_width_px}
              />
              <p className="text-xs text-muted-foreground">
                How wide the popup shows on screen (240–900). Portrait images look best around 380–460.
              </p>
            </div>
          </div>

          {popup.image_url && (
            <label className="flex items-center gap-2.5 text-sm text-foreground">
              <input type="checkbox" name="removeImage" className="size-4 rounded border-input accent-foreground" />
              Remove current image
            </label>
          )}

          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={popup.is_active}
              className="size-4 rounded border-input accent-foreground"
            />
            Show this popup on the homepage
          </label>
          <p className="-mt-1 text-xs text-muted-foreground">
            Turn off to hide it without losing the image. A visitor who has already closed the current
            image won’t see it again — upload a new image to show a fresh offer.
          </p>
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Saving…" : "Save Offer Popup"}
      </Button>
    </form>
  );
}
