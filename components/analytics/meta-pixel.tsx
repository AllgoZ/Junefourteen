"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Meta (Facebook) Pixel — storefront-only conversion tracking.
 *
 * Mounted once in `app/(site)/layout.tsx`. The admin panel has its own,
 * separate root layout (ARCHITECTURE.md §17), so this never loads on any
 * `/admin/*` route — no runtime path check needed.
 *
 * Gated on `NEXT_PUBLIC_META_PIXEL_ID`: renders nothing when the env var is
 * unset, so local dev / preview deploys carry no tracking code unless
 * explicitly configured. The id isn't a secret (it ships to the browser),
 * hence `NEXT_PUBLIC_`.
 *
 * The inline `<Script>` is the exact base snippet from the Meta Events
 * Manager (loads `fbevents.js`, `fbq('init', ...)`, first `PageView`). The
 * storefront is a client-navigated SPA, so a hard-load-only `PageView` would
 * miss almost every view — the effect below re-fires `PageView` on each
 * client-side route change, skipping the very first run since the inline
 * snippet already sent that one. Only the `PageView` event is tracked; no
 * `AddToCart`/`Purchase`/etc. custom events (future work — ARCHITECTURE.md §23).
 *
 * CSP: `connect.facebook.net` (script) + `www.facebook.com` (the `/tr/`
 * event beacons, sent by both image GET and `sendBeacon`) are allowlisted in
 * `next.config.ts#buildCsp()`.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function MetaPixel() {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!PIXEL_ID) return;
    if (trackedPath.current === null) {
      // First mount: the inline base snippet already sent PageView for this
      // path. Record it so Strict Mode's double-invoke doesn't re-fire.
      trackedPath.current = pathname;
      return;
    }
    if (trackedPath.current === pathname) return;
    trackedPath.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* Tracking beacon, not real imagery — next/image is inapplicable inside <noscript>. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
