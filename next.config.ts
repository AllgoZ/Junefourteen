import type { NextConfig } from "next";

/**
 * Audited against every external resource this app actually loads client-
 * side (SECURITY.md's prior finding): Supabase (auth/API), Cloudinary
 * (images), Razorpay Checkout (script + its own iframe/XHR for
 * card/UPI/netbanking/wallet flows — kept as a `*.razorpay.com` wildcard
 * rather than enumerating exact subdomains, since Razorpay uses different
 * ones per payment method and a too-narrow list would silently break some
 * of them), and self-hosted fonts (next/font/google — zero runtime request
 * to Google's own font CDN, so no fonts.gstatic.com entry is needed here,
 * unlike a typical Next+Google-Fonts CSP).
 *
 * `'unsafe-inline'` on **both** script-src and style-src, matching Next's
 * own documented "Without Nonces" CSP pattern exactly
 * (node_modules/next/dist/docs/.../content-security-policy.md) — this is
 * not optional here. Next inlines its own hydration/RSC-streaming payload
 * as <script> tags directly into the HTML (the `self.__next_f.push(...)`
 * chunks that swap a loading.tsx skeleton for real content); omitting
 * `'unsafe-inline'` from script-src silently blocks those, which is
 * exactly what happened on the first pass — every route with a `loading.
 * tsx` (`/shop`, `/product/[slug]`, `/collections/[slug]`) got stuck
 * showing its skeleton forever, because the script that would render the
 * resolved content never ran. The documented alternative (a per-request
 * nonce generated in proxy.ts) requires forcing **every** page to dynamic
 * rendering and disables ISR/static generation sitewide — a far worse
 * regression for an app that relies on static/ISR pages throughout
 * (ARCHITECTURE.md §19) — so the static, `'unsafe-inline'`-based policy
 * below is the correct choice for this app, not a shortcut. It still
 * blocks the main class of CSP-relevant attack (loading a script from an
 * attacker-controlled *origin*, via script-src's allowlist) — SECURITY.md
 * separately confirms no `dangerouslySetInnerHTML`/injection point exists
 * for an inline-script XSS to exploit in the first place.
 */
function buildCsp(): string {
  const isDev = process.env.NODE_ENV !== "production";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "https://checkout.razorpay.com",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
    "font-src": ["'self'"],
    "connect-src": [
      "'self'",
      "https://*.supabase.co",
      "https://*.razorpay.com",
      ...(isDev ? ["ws://localhost:*", "http://localhost:*"] : []),
    ],
    "frame-src": ["https://*.razorpay.com"],
    "frame-ancestors": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

const nextConfig: NextConfig = {
  // Top-level key in this Next version (not experimental.reactCompiler,
  // which was the location in older Next releases — confirmed against
  // node_modules/next/dist/docs/.../reactCompiler.md before writing this,
  // per AGENTS.md). The codebase already enforces the compiler's lint
  // rules as build errors (eslint-config-next's core-web-vitals), so this
  // turns on the actual runtime optimization the app was already written
  // to be safe for, rather than just following its constraints for free.
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: buildCsp() },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  // Next's default 1MB cap on a Server Action's request body is well below
  // a real product/banner/collection photo (a phone/camera JPG easily runs
  // 3-8MB) — every image upload in the admin goes through a Server Action
  // (uploadProductImageAction, saveCollectionAction, saveBannerAction), so
  // this raises the ceiling globally rather than per-route. 10mb comfortably
  // covers real photography while still being a firm bound, not unlimited.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary/loader.ts",
    // Defense-in-depth: even though the custom loader means Next never
    // proxies/optimizes these URLs itself, keep remotePatterns restrictive
    // (not a broad wildcard) per the backend brief's §12 instruction.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`,
      },
    ],
  },
};

export default nextConfig;
