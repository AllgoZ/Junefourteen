/**
 * Single source of truth for the hero banner's real on-screen proportions,
 * so the admin's crop-preview frames and recommended upload sizes can never
 * drift out of sync with each other (they previously did: the preview frame
 * used an arbitrary 2.25:1 box while the copy recommended a 2:1 image).
 *
 * The hero itself (components/home/hero-section.tsx) renders at h-[75dvh],
 * full viewport width — there's no single fixed aspect ratio, it depends on
 * the visitor's actual viewport. These are representative reference
 * viewports (a common laptop size, and the iPhone 12–14 logical size — one
 * of the most common phone viewports in the world) used to derive one
 * concrete, defensible ratio per breakpoint.
 */
const HERO_HEIGHT_VH = 0.75; // matches h-[75dvh]

function heroCropRatio(viewportWidth: number, viewportHeight: number) {
  const heroHeight = viewportHeight * HERO_HEIGHT_VH;
  return viewportWidth / heroHeight;
}

const DESKTOP_REFERENCE_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_REFERENCE_VIEWPORT = { width: 390, height: 844 };

export const DESKTOP_HERO_ASPECT = heroCropRatio(DESKTOP_REFERENCE_VIEWPORT.width, DESKTOP_REFERENCE_VIEWPORT.height); // 2.133 (1440:675)
export const MOBILE_HERO_ASPECT = heroCropRatio(MOBILE_REFERENCE_VIEWPORT.width, MOBILE_REFERENCE_VIEWPORT.height); // 0.616 (390:633)

/** Tailwind arbitrary `aspect-[]` values — exact, not rounded. */
export const DESKTOP_ASPECT_CLASS = "aspect-[1440/675]";
export const MOBILE_ASPECT_CLASS = "aspect-[390/633]";

export const BANNER_UPLOAD_GUIDANCE = {
  desktop: "1920×900px or larger (2.13:1) — matches the hero on a laptop screen",
  mobile: "1080×1755px or larger (portrait, ~0.62:1) — matches the hero on a phone screen",
} as const;
