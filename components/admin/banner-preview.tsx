"use client";

import { cn } from "@/lib/utils";
import { DESKTOP_ASPECT_CLASS, MOBILE_ASPECT_CLASS } from "@/lib/config/hero-dimensions";

const FRAME_CLASS = {
  desktop: cn("w-72", DESKTOP_ASPECT_CLASS),
  mobile: cn("w-40", MOBILE_ASPECT_CLASS),
};

/**
 * Live "how will this actually look" preview for one banner image — sized
 * via `aspect-[]` classes derived from lib/config/hero-dimensions.ts, the
 * same numbers behind the recommended-upload-size copy, so the frame shape
 * and the size guidance can never disagree with each other. Plain <img>,
 * not next/image: the source can be a client-only blob: object URL for a
 * not-yet-uploaded file, which next/image's Cloudinary loader can't handle.
 */
export function BannerPreviewFrame({
  kind,
  src,
  objectPosition,
}: {
  kind: "desktop" | "mobile";
  src?: string;
  objectPosition: string;
}) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-lg border border-border bg-muted", FRAME_CLASS[kind])}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition }} />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
      )}
    </div>
  );
}
