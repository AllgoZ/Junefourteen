"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import cloudinaryLoader from "@/lib/cloudinary/loader";
import type { OfferPopup as OfferPopupData } from "@/lib/services/offer-popup";

const SEEN_KEY = "jf:offer-popup-seen";

/**
 * Homepage promotional popup — one admin-uploaded image (no text of its
 * own), shown once when a visitor first loads the site. Dismissal is
 * persisted in localStorage keyed on the image URL, so it never reappears
 * for that visitor until the admin uploads a new offer image. Mounted only
 * in app/(site)/page.tsx, so it can't appear on any other route or in the
 * admin panel. Renders nothing at all when there's no active offer.
 */
export function OfferPopup({ popup }: { popup: OfferPopupData | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup) return;
    try {
      if (localStorage.getItem(SEEN_KEY) === popup.imageUrl) return;
    } catch {
      // private mode / storage disabled — fall through and show it
    }
    // Deferred out of the effect body (react-hooks/set-state-in-effect) and
    // a small settle delay so it doesn't fight the hero on first paint.
    const t = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(t);
  }, [popup]);

  const dismiss = useCallback(() => {
    try {
      if (popup) localStorage.setItem(SEEN_KEY, popup.imageUrl);
    } catch {
      // ignore — worst case it shows once more next visit
    }
    setOpen(false);
  }, [popup]);

  if (!popup) return null;

  const img = (
    <Image
      loader={cloudinaryLoader}
      src={popup.imageUrl}
      alt={popup.imageAlt}
      width={popup.imageWidth ?? 900}
      height={popup.imageHeight ?? 1200}
      sizes="(max-width: 640px) 90vw, 900px"
      className="block h-auto w-full"
      priority
    />
  );

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) dismiss(); }}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-w-none overflow-hidden rounded-xl border-0 bg-transparent p-0 ring-0 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.45)] sm:max-w-none"
        style={{ width: `min(${popup.displayWidthPx}px, calc(100vw - 2rem))` }}
      >
        <DialogTitle className="sr-only">Special offer</DialogTitle>

        {popup.linkHref ? (
          <Link href={popup.linkHref} onClick={dismiss} className="block">
            {img}
          </Link>
        ) : (
          <button type="button" onClick={dismiss} className="block w-full" aria-label="Close offer">
            {img}
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
