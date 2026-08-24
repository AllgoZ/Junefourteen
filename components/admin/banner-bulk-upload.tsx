"use client";

import { useActionState, useState } from "react";
import { Images, Smartphone, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BANNER_UPLOAD_GUIDANCE } from "@/lib/config/hero-dimensions";
import { bulkCreateBannersAction, type BulkBannerFormState } from "@/app/admin/(protected)/banners/actions";

const INITIAL_STATE: BulkBannerFormState = {};

export function BannerBulkUpload() {
  const [state, action, pending] = useActionState(bulkCreateBannersAction, INITIAL_STATE);
  const [desktopCount, setDesktopCount] = useState(0);
  const [mobileCount, setMobileCount] = useState(0);

  return (
    <form action={action} className="mt-5 flex flex-col gap-4 rounded-xl border border-dashed border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Images className="size-4 text-muted-foreground" aria-hidden="true" strokeWidth={1.75} />
        Add multiple banners at once
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bulk-desktop-images" className="flex items-center gap-1.5">
            <Laptop className="size-3.5 text-muted-foreground" aria-hidden="true" />
            Laptop Images
          </Label>
          <input
            id="bulk-desktop-images"
            name="desktopImages"
            type="file"
            accept="image/*"
            multiple
            className="text-sm"
            onChange={(e) => setDesktopCount(e.target.files?.length ?? 0)}
          />
          <p className="text-xs text-muted-foreground">{BANNER_UPLOAD_GUIDANCE.desktop}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bulk-mobile-images" className="flex items-center gap-1.5">
            <Smartphone className="size-3.5 text-muted-foreground" aria-hidden="true" />
            Mobile Images (optional)
          </Label>
          <input
            id="bulk-mobile-images"
            name="mobileImages"
            type="file"
            accept="image/*"
            multiple
            className="text-sm"
            onChange={(e) => setMobileCount(e.target.files?.length ?? 0)}
          />
          <p className="text-xs text-muted-foreground">{BANNER_UPLOAD_GUIDANCE.mobile}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The 1st laptop image pairs with the 1st mobile image, the 2nd with the 2nd, and so on — one banner per
        laptop image. Leave mobile empty (or shorter) and those banners just fall back to their laptop image on
        mobile. Open any banner afterward to add a link or fine-tune the crop.
        {desktopCount > 0 && (
          <span className="mt-1 block font-medium text-foreground">
            {desktopCount} laptop{mobileCount > 0 ? ` + ${mobileCount} mobile` : ""} selected
            {mobileCount > desktopCount ? ` — ${mobileCount - desktopCount} mobile image${mobileCount - desktopCount === 1 ? "" : "s"} won't be used` : ""}
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending || desktopCount === 0} className="self-start">
          {pending
            ? "Uploading…"
            : desktopCount > 1
              ? `Add ${desktopCount} Banners`
              : desktopCount === 1
                ? "Add Banner"
                : "Add Banners"}
        </Button>
        {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        {!state.error && state.createdCount ? (
          <p className="text-xs text-muted-foreground">
            Added {state.createdCount} banner{state.createdCount === 1 ? "" : "s"}.
            {state.unusedMobileCount
              ? ` ${state.unusedMobileCount} extra mobile image${state.unusedMobileCount === 1 ? "" : "s"} had no laptop image to pair with and ${state.unusedMobileCount === 1 ? "was" : "were"} skipped.`
              : ""}
          </p>
        ) : null}
      </div>
    </form>
  );
}
