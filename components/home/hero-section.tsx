"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditorialImage } from "@/components/ui/editorial-image";
import { site } from "@/lib/config/site";
import { GALLERY_IMAGES } from "@/lib/mock-data/gallery-images";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types/product";

/**
 * Used only if the admin-managed `banners` table has zero active rows, so
 * the homepage never renders an empty hero. No dedicated portrait crop
 * exists for these, so mobileObjectPosition just reuses the desktop value —
 * a real banner created in the admin can set its own instead.
 */
const FALLBACK_BANNERS: Banner[] = [
  { id: "fallback-0", src: GALLERY_IMAGES[5], objectPosition: "50% 15%", mobileObjectPosition: "50% 15%", tone: 0.55, alt: `${site.name} new collection campaign imagery`, mobileAlt: `${site.name} new collection campaign imagery` },
  { id: "fallback-1", src: GALLERY_IMAGES[4], objectPosition: "50% 20%", mobileObjectPosition: "50% 20%", tone: 0.55, alt: `${site.name} new collection campaign imagery`, mobileAlt: `${site.name} new collection campaign imagery` },
  { id: "fallback-2", src: GALLERY_IMAGES[3], objectPosition: "50% 15%", mobileObjectPosition: "50% 15%", tone: 0.55, alt: `${site.name} new collection campaign imagery`, mobileAlt: `${site.name} new collection campaign imagery` },
  { id: "fallback-3", src: GALLERY_IMAGES[0], objectPosition: "50% 35%", mobileObjectPosition: "50% 35%", tone: 0.55, alt: `${site.name} new collection campaign imagery`, mobileAlt: `${site.name} new collection campaign imagery` },
];

const AUTOPLAY_MS = 5000;

/**
 * A 3/4-screen, text-free (image + one small link only) banner carousel —
 * real horizontal scroll-snap (same swipe/drag idiom as the PDP's mobile
 * gallery in product-gallery.tsx) so it's manually swipeable/scrollable, not
 * just a timed crossfade; autoplay advances it on top of that by calling
 * scrollTo, and backs off for one cycle whenever a manual scroll was just
 * detected so it doesn't yank the carousel out from under someone
 * mid-swipe. Pulled up under the header via negative margin so the
 * transparent-over-hero nav (SiteHeader) actually overlays the photo
 * instead of sitting on blank page background above it.
 * This section renders at h-[75dvh] with no fixed image aspect ratio — the
 * admin's crop-preview frames and recommended upload sizes (banner-form.tsx,
 * banner-preview.tsx) are derived from lib/config/hero-dimensions.ts, which
 * computes what that 75dvh actually looks like at representative laptop/
 * phone viewports, so admin guidance stays consistent with this component
 * without hardcoding a number here too.
 * Banners are admin-managed (see app/admin/(protected)/banners) — this
 * component takes them as a prop rather than owning the data itself.
 * Each slide is one big link (banner.link, defaulting to /shop) — the whole
 * image is clickable, not just the small bottom-right text — a native <a>
 * inside the scroll-snap track already distinguishes a drag/swipe from a
 * tap, so this doesn't interfere with the swipeable carousel above it.
 */
export function HeroSection({ banners }: { banners: Banner[] }) {
  const activeBanners = banners.length > 0 ? banners : FALLBACK_BANNERS;
  // Seamless loop: append a clone of the first banner so the scroll-snap
  // track has somewhere to go past the last real slide — see onScroll below.
  const slides = [...activeBanners, activeBanners[0]];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef(0);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const currentBanner = activeBanners[index];

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastInteractionRef.current < AUTOPLAY_MS) return;
      const el = scrollerRef.current;
      if (!el) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      el.scrollTo({ left: (current + 1) * el.clientWidth, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section data-hero className="relative -mt-14 h-[75dvh] overflow-hidden sm:-mt-[72px]">
      <div
        ref={scrollerRef}
        onScroll={() => {
          const el = scrollerRef.current;
          if (!el) return;
          const current = Math.round(el.scrollLeft / el.clientWidth);
          setIndex(current % activeBanners.length);
          lastInteractionRef.current = Date.now();

          // Once scrolling settles on the cloned slide, snap back to the
          // real first slide with no animation — same image, so it's invisible.
          if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
          scrollEndTimerRef.current = setTimeout(() => {
            if (current === activeBanners.length) {
              el.scrollTo({ left: 0, behavior: "auto" });
            }
          }, 80);
        }}
        className="no-scrollbar snap-x-mandatory flex h-full overflow-x-auto"
      >
        {slides.map((banner, i) => (
          <Link
            key={i}
            href={banner.link?.href ?? "/shop"}
            aria-label={banner.link?.label ?? "Shop Now"}
            className="relative flex h-full w-full shrink-0 snap-start"
          >
            {/* Genuinely different source images per breakpoint, not just a
                different crop of one photo — some campaign shots can't be
                reframed into both a wide laptop composition and a tall
                mobile one. Both are in the DOM; CSS display toggles which
                renders, so next/image's lazy-loading (based on layout size)
                never fetches the hidden one — except on the first slide,
                which forces `priority` on both since SSR can't know the
                visitor's breakpoint ahead of time. */}
            <EditorialImage
              src={banner.mobileSrc ?? banner.src}
              tone={banner.tone}
              alt={banner.mobileAlt}
              priority={i === 0}
              sizes="100vw"
              objectPosition={banner.mobileObjectPosition}
              className="absolute inset-0 h-full w-full sm:hidden"
            />
            <EditorialImage
              src={banner.src}
              tone={banner.tone}
              alt={banner.alt}
              priority={i === 0}
              sizes="100vw"
              objectPosition={banner.objectPosition}
              className="absolute inset-0 hidden h-full w-full sm:block"
            />
          </Link>
        ))}
      </div>

      {/* Top scrim so the transparent nav's white text/icons stay legible over any banner. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent sm:h-40" />

      <div className="pointer-events-none absolute right-6 bottom-6 flex flex-col items-end gap-3 sm:right-10 sm:bottom-10">
        <Link
          href={currentBanner?.link?.href ?? "/shop"}
          className="pointer-events-auto text-xs tracking-[0.2em] text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-70"
        >
          {currentBanner?.link?.label ?? "Shop Now"}
        </Link>

        <div className="pointer-events-auto flex items-center gap-1.5">
          {activeBanners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Show banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-[3px] rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-300",
                i === index ? "w-6 bg-white" : "w-3 bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
