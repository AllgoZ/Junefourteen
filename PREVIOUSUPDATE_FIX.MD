# JUNEFOURTEEN — Previous Update & Fix Log

A short, **recency-ordered** record of what shipped most recently and why —
read this before `Architecture Files/ARCHITECTURE.md`'s full history (§12) if
you just need "what happened lately" rather than the whole project story.
Each entry names the commit(s), the files touched, and — for a fix — the
actual root cause, not just the symptom. `ARCHITECTURE.md` remains the
authoritative record; this file is a fast-read companion to it, not a
replacement. If the two ever disagree, trust `ARCHITECTURE.md`.

All commits below are pushed to both remotes (`origin` →
github.com/AllgoZ/Junefourteen, `site-repo` →
github.com/AllgoZ/junefourteensite), which are kept in sync.

---

## 2026-09-02 — Homepage header white-bar flash, fixed for real (root cause was SSR, not JS timing)

**Commit:** `e709f8d`

Two earlier rounds (`7901e8e`, `67949db` — see below) each "confirmed SSR was
correct" by `curl`-ing a **local** `next build`. Both were checking the wrong
thing: on a **local** build, `usePathname()` resolves to `/` during the static
prerender of the homepage, so `<SiteHeader>` correctly renders
`bg-transparent`. On **Vercel**, the same static prerender resolves
`usePathname()` to **`null`**, so the header's non-home fallback
(`bg-background/70 backdrop-blur-sm` + dark text) ships inside the deployed
`/` HTML — a real solid-bar flash over the hero on every load, until React
hydrates and corrects it. `curl https://www.junefourteen.in/` showed it
directly; `curl localhost` after a local build never did.

**Fix** (no more JS timing work):
- `app/(site)/globals.css` — one CSS rule,
  `body:has([data-hero]) header[data-scrolled="false"]`, pins the header
  transparent + white text over the hero. `<section data-hero>`
  (`hero-section.tsx`) only ever exists on `/`, and first paint is always at
  scroll 0, so this is correct in the static HTML itself — no JS needed for
  the initial paint to be right.
- `components/layout/site-header.tsx` — the header now carries an inert
  `data-scrolled={scrolled}` attribute (the CSS hook above; drops the rule
  the instant the hero scrolls away) and the `IntersectionObserver` callback
  ignores a reading where the hero's `boundingClientRect.height` is `0`
  (layout/`dvh` not yet resolved), so it can't itself flip the header solid
  at the top of the page.

**Verified**: headless Chromium against the actual built CSS — forcing the
header into the exact buggy state (`bg-background/70` class +
`data-scrolled="false"` + hero present) computes to a transparent
background, no backdrop-filter, and white wordmark/icons. Scrolled state and
every non-homepage route are byte-identical to before.

**Docs**: `ARCHITECTURE.md` §10 ("Follow-up — the white bar was still there,
and this time SSR *was* the problem"), `FRONTEND.md` §9 (new gotcha:
`usePathname()` can resolve `null` during a static prerender on some hosts
even with no dynamic params — don't trust a local-build `curl` as proof of a
`pathname`-dependent SSR branch).

---

## 2026-09-02 — Per-piece product pricing + per-product size-chart image

**Commit:** `8fb9698`

Two independent product-page features, both fully optional per product
(zero behavior change for any product that doesn't use them):

1. **Size-chart image.** Admin can upload one image per product
   (`products.size_chart_image_url`/`_cloudinary_public_id`/`_image_alt`,
   migration `0020`). When set, the PDP's "Size Guide" popup shows **just
   that image** instead of the generic hardcoded table. No image → unchanged
   behavior. The standalone `/size-guide` page (brand-wide generic guide) is
   untouched either way.
2. **Per-piece pricing.** Admin defines named "pieces" for a product (e.g.
   Top ₹1,099, Bottom ₹700, Dupatta ₹700 — new `product_pieces` table,
   migration `0021`), each with a "ticked by default" flag. On the product
   page the customer ticks any combination (at least one, enforced) via the
   new `components/product/piece-selector.tsx` chip group, and the displayed
   price is the **live sum** of the ticked pieces. Size stays a fully
   separate choice. Zero pieces on a product ⇒ it behaves exactly as a
   normal single-price product always has.

**The security-critical part**: the price a customer sees is never trusted
at checkout. `app/(site)/checkout/actions.ts#createOrderAction` re-derives
the charged price **server-side** as the sum of the selected pieces' live
prices (`getProductsForPricing`), and rejects the line with a clear
"re-select the pieces" message if the client sends an empty or unrecognized
piece set. The chosen combination is snapshotted onto the order
(`order_items.selected_pieces`, e.g. `"Top + Bottom + Dupatta"`) and shown on
both `/admin/orders/[id]` and `/account/orders/[id]` next to the size.

**Admin**: the product form gained a **Size Chart** card (upload/replace/
remove, same pattern as the Collections cover image) and a **Pieces &
Pricing** card (a repeatable name/price/"default" list, reconciled
id-preservingly — not delete-and-reinsert — so an in-progress cart's
`selected_piece_ids` survives an unrelated product edit). Both work at
create time, not just edit (unlike the product images manager).

**Docs**: `ARCHITECTURE.md` §14 (schema), §16 (checkout pricing), §17
(admin form); `FRONTEND.md` (component + directory map); `backend.md`
(schema reference + migration count).

---

## 2026-09-02 — Grid-card "Sold Out" chip sized down

**Commit:** `a09df8a`

Direct feedback that the top-left "SOLD OUT" chip on product-grid cards read
a touch large. `components/product/product-card.tsx`:
`text-[10px]`→`text-[9px]`, `tracking-[0.14em]`→`0.12em`, `px-1.5`→`px-1`.
Chip background/color/position unchanged; the wishlist grid's own (visually
different) Sold Out label is untouched.

---

## 2026-09-01 — Google Analytics 4 added

**Commit:** `ced3354`

GA4 (`gtag.js`, measurement id set via env) loads on the storefront only
(`components/analytics/google-analytics.tsx`, mounted in
`app/(site)/layout.tsx`), gated on `NEXT_PUBLIC_GA_MEASUREMENT_ID` — unset
means zero analytics code ships. Unlike the Meta Pixel below, this is a
**Server Component** with no client hook: GA4's own "Enhanced Measurement"
(page changes based on browser-history events) already counts client-side
route changes, so no manual `page_view` firing is needed. `next.config.ts`'s
CSP gained `www.googletagmanager.com` (script) and
`*.google-analytics.com`/`*.analytics.google.com` (the `/g/collect`
beacons). Admin (`/admin/*`) never loads it — separate root layout.

Pageviews only — no GA4 custom/ecommerce events, no Measurement Protocol,
no Google Ads/Signals linking (see `ARCHITECTURE.md` §21).

---

## 2026-09-01 — `backend.md` guide added, docs backfilled

**Commit:** `1f71b18`

New `Architecture Files/backend.md` — the "about to write backend code"
companion to `ARCHITECTURE.md` (Supabase client conventions, the
repository/service/action layering, a compact schema/RLS map, auth
patterns, payments, rate limiting, backend gotchas), mirroring what
`FRONTEND.md` already does for UI code. Also backfilled documentation that
had fallen behind already-shipped code: `FRONTEND.md` (the two admin-form
shapes, the request-to-order dialog, the `/account` Order Requests tab),
`SECURITY.md` (§8 rate-limit note, new §10 — exactly what the Meta Pixel
shares with a third party), and a `RAZORPAY_WEBHOOK_SECRET` line missing
from `ARCHITECTURE.md`'s env-var table.

---

## 2026-09-01 — Guest "Request to Order" now links/creates an account; dialog mobile-keyboard fix

**Commit:** `ac302f4`

1. `submitOrderRequestAction` now finds-or-creates a customer account for a
   guest's phone number (`lib/services/auth.ts#linkOrCreateAccountByMobile`
   — a standalone variant of the mobile-signup mechanism, deliberately not
   sharing code with it) and signs them in, so a "Request to Order" lead is
   never left unattributed when it doesn't have to be — the customer can see
   it later under **Account → Order Requests**. Never touches an
   already-signed-in visitor's session; fails silently rather than blocking
   the actual submission if the linking step itself errors.
2. `request-to-order-dialog.tsx`'s mobile fix from the previous round wasn't
   enough — a phone's on-screen keyboard shrinks the *visible* viewport
   without reliably updating a plain `vh` unit, so part of the six-field
   form could still render behind the keyboard. Switched to `dvh` (tracks
   the real visible viewport, same unit the hero uses) and anchored the
   dialog near the top on mobile instead of centering it, reverting to
   centered at `sm:` and up.

Docs: `ARCHITECTURE.md`, `SECURITY.md`, and `walkthrough.md` all updated in
the same commit.

---

## 2026-09-01 — Meta Pixel added

**Commit:** `98abac5`

The Meta (Facebook) Pixel base snippet, wired in as
`components/analytics/meta-pixel.tsx` — storefront-only, mounted in
`app/(site)/layout.tsx`, gated on `NEXT_PUBLIC_META_PIXEL_ID` (unset → zero
tracking code). Unlike GA4, Meta has no built-in SPA-navigation pageview
mechanism, so this is a **Client Component**: a `usePathname()` +
`useEffect` re-fires `PageView` on each client-side route change (a
`useRef<string | null>` guards against firing twice on the very first
render). `next.config.ts`'s CSP gained `connect.facebook.net` (script) and
`www.facebook.com` (the `/tr/` beacons, sent as both an image GET and
`navigator.sendBeacon`). Pageviews only — no `AddToCart`/`Purchase`/etc.
custom events, no Meta Conversions API.

---

## Earlier, now-superseded header fix attempts (context for the 2026-09-02 fix above)

- **`67949db`** (2026-09-02) — Replaced a `window.scrollY > window.innerHeight
  * 0.7` scroll-threshold comparison with an `IntersectionObserver` watching
  the hero element directly, because *any* early `scroll` event (mobile
  address-bar collapse, `dvh` resolution, browser scroll-restoration) firing
  before `window.innerHeight`/`scrollY` settle could make that comparison
  true near the top of the page. This was a real fix for a real bug, but not
  *the* bug the user kept seeing — see the 2026-09-02 entry above for why.
- **`7901e8e`** (2026-08-31) — Removed a synchronous `onScroll()` call at
  mount, which was reading `window.innerHeight`/`scrollY` before a mobile
  browser's `dvh`-based layout had settled. Also a real fix for a real bug,
  also not the full story.

Both are kept in `ARCHITECTURE.md` §10 in full, in order — the point of
leaving all three write-ups in place (rather than deleting the "wrong"
ones) is that each one really did fix something; none of them, alone, was
sufficient, and the actual root cause (`usePathname()` resolving `null`
during Vercel's static prerender) wasn't visible from `curl localhost`
alone — only from `curl`-ing the live deployment.

---

## What to check if you're picking this up fresh

- `git log --oneline -20` and `git status` — confirm you're looking at the
  same HEAD this file describes, and that both remotes are still in sync
  (`git log --oneline origin/main..HEAD` / `site-repo/main..HEAD` should
  both be empty).
- `npx tsc --noEmit && npm run lint && npm run build` — all clean as of
  every commit above.
- Live env vars for the two analytics integrations
  (`NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`) are set on
  the hosting platform, not in this repo — confirm with whoever manages
  deployment if pageviews aren't showing up in Meta Events Manager / GA4.
- The header fix only takes effect **after a redeploy** from `e709f8d` or
  later — if a "white bar on homepage load" report comes in again, first
  confirm which commit is actually live before assuming the fix regressed.
