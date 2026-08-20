"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditorialImage } from "@/components/ui/editorial-image";
import { site } from "@/lib/config/site";
import { GALLERY_IMAGES } from "@/lib/mock-data/gallery-images";
import { cn } from "@/lib/utils";

const BANNERS = [
  { src: GALLERY_IMAGES[5], objectPosition: "50% 15%" }, // models-duo-red-maroon-sets
  { src: GALLERY_IMAGES[4], objectPosition: "50% 20%" }, // model-purple-kurta-red-door
  { src: GALLERY_IMAGES[3], objectPosition: "50% 15%" }, // model-maroon-anarkali-printed-dupatta
  { src: GALLERY_IMAGES[0], objectPosition: "50% 35%" }, // model-cream-anarkali-blue-wall (Y tuned — subject sits lower in this source photo than the others)
];

// Seamless loop: append a clone of the first banner so the scroll-snap track
// has somewhere to go past the last real slide. Once the clone settles into
// view we silently jump the scroll position back to the real first slide —
// same image, so the reset is imperceptible, and both autoplay and manual
// swipe can keep going "forward" past the last slide instead of hitting a
// dead stop.
const SLIDES = [...BANNERS, BANNERS[0]];

const AUTOPLAY_MS = 5000;

/**
 * A 3/4-screen, text-free banner carousel — real horizontal scroll-snap
 * (same swipe/drag idiom as the PDP's mobile gallery in product-gallery.tsx)
 * so it's manually swipeable/scrollable, not just a timed crossfade; autoplay
 * advances it on top of that by calling scrollTo, and backs off for one
 * cycle whenever a manual scroll was just detected so it doesn't yank the
 * carousel out from under someone mid-swipe. Pulled up under the header via
 * negative margin so the transparent-over-hero nav (SiteHeader) actually
 * overlays the photo instead of sitting on blank page background above it.
 */
export function HeroSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef(0);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [index, setIndex] = useState(0);

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
    <section className="relative -mt-14 h-[75dvh] overflow-hidden sm:-mt-[72px]">
      <div
        ref={scrollerRef}
        onScroll={() => {
          const el = scrollerRef.current;
          if (!el) return;
          const current = Math.round(el.scrollLeft / el.clientWidth);
          setIndex(current % BANNERS.length);
          lastInteractionRef.current = Date.now();

          // Once scrolling settles on the cloned slide, snap back to the
          // real first slide with no animation — same image, so it's invisible.
          if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
          scrollEndTimerRef.current = setTimeout(() => {
            if (current === BANNERS.length) {
              el.scrollTo({ left: 0, behavior: "auto" });
            }
          }, 80);
        }}
        className="no-scrollbar snap-x-mandatory flex h-full overflow-x-auto"
      >
        {SLIDES.map((banner, i) => (
          <div key={i} className="relative h-full w-full shrink-0 snap-start">
            <EditorialImage
              src={banner.src}
              tone={0.55}
              alt={`${site.name} new collection campaign imagery`}
              priority={i === 0}
              sizes="100vw"
              objectPosition={banner.objectPosition}
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ))}
      </div>

      {/* Top scrim so the transparent nav's white text/icons stay legible over any banner. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent sm:h-40" />

      <div className="absolute right-6 bottom-6 flex flex-col items-end gap-3 sm:right-10 sm:bottom-10">
        <Link
          href="/shop"
          className="text-xs tracking-[0.2em] text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-70"
        >
          Shop Now
        </Link>

        <div className="flex items-center gap-1.5">
          {BANNERS.map((banner, i) => (
            <button
              key={banner.src}
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
