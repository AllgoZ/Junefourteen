import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js) — storefront-only.
 *
 * Mounted once in `app/(site)/layout.tsx`, next to <MetaPixel />. The admin
 * panel has its own separate root layout (ARCHITECTURE.md §17), so GA never
 * loads on any `/admin/*` route — no runtime path check needed.
 *
 * Gated on `NEXT_PUBLIC_GA_MEASUREMENT_ID`: renders nothing when the env var
 * is unset, so local dev / preview deploys carry no analytics unless
 * explicitly configured. The id ships to the browser (not a secret), hence
 * `NEXT_PUBLIC_`.
 *
 * The two `<Script>`s are the verbatim gtag.js snippet from GA4 (async
 * loader + `dataLayer`/`gtag`/`config` init). `gtag('config', ...)` sends
 * the initial `page_view`; client-side route changes are counted by GA4's
 * Enhanced Measurement ("page changes based on browser history events") —
 * the same mechanism Next's own docs and `@next/third-parties` rely on, so
 * there is deliberately no manual `page_view` firing here (that would need
 * `send_page_view: false` and would double-count if Enhanced Measurement is
 * left on). This is why, unlike `meta-pixel.tsx`, this component needs no
 * `"use client"` / `usePathname` hook. Pageviews only for now; no custom or
 * ecommerce events (future work — ARCHITECTURE.md §23).
 *
 * CSP: `www.googletagmanager.com` (script) + `*.google-analytics.com` /
 * `*.analytics.google.com` (the `/g/collect` beacons) are allowlisted in
 * `next.config.ts#buildCsp()`.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
