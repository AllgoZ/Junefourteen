# JUNEFOURTEEN — Performance & Optimization Audit

A point-in-time review of caching, rendering, image/font delivery, and
database query patterns — done by reading the actual implementation and, for
build-time claims, verified against a real `npm run build` output. See
`ARCHITECTURE.md` §18/§19 for the underlying pipeline write-ups this checks
against, and `FRONTEND.md` §7 for the data-fetching convention this all sits
on top of.

## Executive summary

The caching and image-delivery layers are well-designed and consistently
applied — every content type follows the same tag-and-revalidate shape, and
the Cloudinary loader correctly avoids double image optimization.

**Update — production hardening pass** (`prompt files/hardening.md`, see
`ARCHITECTURE.md` §22): the React Compiler is now enabled (finding 1,
fixed). SEO (finding 2) was explicitly out of scope for that pass per its
own instructions and stays untouched. Finding 3 (bundle/code-splitting) was
re-evaluated during that pass — measured, not just re-asserted — and the
conclusion is still "no clear win to act on" (see §6 below for what was
actually checked this time). That pass also root-caused and fixed a real
perceived-latency bug in the sign-in flow that this document hadn't
previously covered — see the new §8 below.

| # | Finding | Impact | Status |
|---|---|---|---|
| 1 | React Compiler not enabled, despite code already following its rules | Medium (auto-memoization left on the table) | **Fixed** — `next.config.ts`, §22 |
| 2 | No `sitemap.ts`/`robots.ts` | Low (SEO/crawl discoverability) | Out of scope (SEO), unchanged |
| 3 | No `next/dynamic` code-splitting anywhere; one `Suspense` boundary total | Low (bundle is small enough that this isn't visibly hurting yet) | Re-verified, no action — see §6 |
| 4 | A few admin repositories `select("*")` where a narrower column list would do | Very low (admin-only, low-traffic, small tables) | Evaluated again during the hardening pass, still not worth it — see §5 |

## 1. Rendering strategy — hybrid static + tag-based ISR

Classic Next caching model, not Cache Components (`ARCHITECTURE.md` §9.11
explains why that toggle matters and wasn't used). Verified via `npm run
build` output:

- **Statically prerendered at build time**: `/`, `/about`, `/cart`,
  `/contact`, `/faq`, `/privacy`, `/returns`, `/shipping`, `/size-guide`,
  `/terms`, and every `/product/[slug]` (`generateStaticParams` over the
  full catalog).
- **Server-rendered per request** (`ƒ` in the build output): `/shop`,
  `/collections/[slug]`, `/search`, `/account`, and everything under
  `/admin/*` — because they read `searchParams` or the auth session, both of
  which are genuinely per-request. This is the correct, minimal set of
  routes forced dynamic — nothing here is dynamic "just in case."
- **Layered on top**: an hour-long `unstable_cache` (`revalidate: 3600`) on
  every content-fetching service function, tagged for on-demand
  invalidation. This means even the dynamic routes above aren't hitting the
  database on every request for their *content* (products, collections) —
  only for the per-request pieces (search params, session) that must be
  live.

## 2. Cache tags — verified complete and consistently invalidated

Every `lib/services/*.ts` cache and its matching admin-mutation
`revalidateTag(tag, "max")` call, confirmed present:

| Service | Tag(s) | Invalidated from |
|---|---|---|
| `products.ts` | `products`, `collections`, `product:<slug>`, `collection:<slug>` | product/collection admin actions |
| `banners.ts` | `banners` | banner admin actions |
| `social-links.ts` | `social-links` | settings actions |
| `shipping-zones.ts` | `shipping-zones` | shipping admin actions |
| `tax.ts` | `tax-settings` | settings actions |
| `coupons.ts` | *(not cached — see below)* | — |
| `homepage.ts` | `homepage-campaign`, `homepage-gallery-images` | collections admin actions |

`lib/services/coupons.ts#validateCoupon` is **deliberately never cached** —
correctly so, since usage limits and expiry windows must be checked against
live data on every checkout attempt, not a stale hour-old snapshot. This is
the one intentional exception to the caching pattern, not an oversight.

No stale-tag bugs found: every table with a cached read has exactly one tag,
and every admin action that mutates that table calls `revalidateTag` with
the matching tag before returning. `revalidateTag(tag, "max")` (the
two-argument form) is used consistently — this Next version requires the
second argument; a bare `revalidateTag(tag)` call would silently no-op the
profile-level invalidation strength, so if you add a new cached service,
copy the two-arg form from an existing one rather than typing it from
memory.

## 3. Image pipeline

- **Custom `next/image` loader** (`lib/cloudinary/loader.ts`) hands all
  resizing/format/DPR work to Cloudinary (`f_auto,q_auto,dpr_auto,w_<width>`)
  instead of stacking Next's own image-optimization proxy on top of it —
  confirmed by inspecting rendered `<img>` `srcset` output directly during
  this session's homepage smoke test: URLs point straight at
  `res.cloudinary.com` with the transformation string applied, never at
  `/_next/image`. This avoids paying for image transformation twice.
- Non-Cloudinary sources (the local `/images/*.webp` fallbacks used before
  any admin content exists) pass through the loader untouched and are
  served as static files from `public/` — appropriately, since they're a
  fallback path expected to see decreasing traffic as admin content tables
  fill in.
- `images.remotePatterns` is scoped to `res.cloudinary.com/<cloud_name>/**`,
  not a broad wildcard — defense-in-depth with no cost, since the custom
  loader means Next never actually proxies these URLs itself anyway.
- **Fonts**: all three typefaces (`Inter`, `Fraunces`, `Montserrat`) load via
  `next/font/google` with `display: "swap"` — self-hosted at build time
  (`app/(site)/layout.tsx`), so there is **zero runtime request to Google's
  font CDN** and no font-loading layout shift beyond what `swap` itself
  allows. `Montserrat` is scoped to weight `600` only (its one use is the
  brand wordmark) rather than pulling every weight — a small but correct
  choice that keeps that font file's download size to what's actually used.

## 4. React Compiler — now enabled

`eslint-config-next`'s `core-web-vitals` preset enforces React Compiler's
lint rules (`react-hooks/purity`, `react-hooks/set-state-in-effect`, etc.)
as **errors** throughout this codebase (`FRONTEND.md` §9,
`ARCHITECTURE.md` §9.2) — meaning every component was already written in a
style the compiler can safely auto-memoize. This was previously off:
no `babel-plugin-react-compiler` installed, `next.config.ts` had no
`reactCompiler` key. Fixed in the hardening pass — see `ARCHITECTURE.md`
§22 for the exact sequencing (verify versions → check the bundled Next 16
docs for the *current* config location → install → enable → validate).
One correction worth flagging for future reference: this document
originally assumed the flag would live at `experimental.reactCompiler`
(the older Next convention) — the bundled docs for this exact Next 16.3.0
install confirmed it's actually a **top-level** `reactCompiler` key now.
Always check the installed version's own docs before writing
version-sensitive config, exactly as AGENTS.md instructs.

## 5. Database query patterns

- **No N+1 pattern found in the checkout path**: `getProductsForPricing`
  (called from `createOrderAction`) fetches every cart line's product in one
  batched query keyed by product ids, not one query per line item.
- **Homepage and other multi-fetch pages parallelize correctly**:
  `app/(site)/page.tsx` fires all of its fetches via a single `Promise.all`
  rather than sequential `await`s — six independent fetches (banners,
  collections, new arrivals, best sellers, Black Edit products, campaign
  banner) run concurrently, not one after another.
- **Some admin repositories `select("*")`** (e.g.
  `lib/repositories/admin/homepage.ts`, `admin/tax.ts`) rather than naming
  columns. Deliberately left as-is again during the hardening pass: these
  are singleton/tiny tables (5–7 columns, a handful of rows), so an
  explicit column list would save negligible bytes while adding a
  maintenance cost (every future column addition needs the select list
  updated too). The hardening brief's own instruction — "optimize only when
  measurable or clearly justified" — argues against touching this, not for
  it; a real, justified index (`orders_razorpay_order_id_idx`, added for
  the new webhook's actual query pattern — see `ARCHITECTURE.md` §22) was
  added instead, which is the kind of change that pass's own "no
  speculative indexes/optimizations" instruction was pointing at.

## 6. Bundle size & code-splitting

- **Turbopack** is the build/dev engine in this Next 16 install (confirmed
  in `npm run build` output: `▲ Next.js 16.3.0 (Turbopack)`) — no separate
  opt-in needed, and no known reason to switch back to webpack here.
- **No `next/dynamic` or `React.lazy` usage anywhere** in the codebase, and
  exactly one `Suspense` boundary (`app/admin/login/page.tsx`, wrapping a
  `useSearchParams()` read).
- **Re-measured during the hardening pass, not just re-asserted**: inspected
  `.next/static/chunks/` after a production build. Turbopack's chunk
  filenames are content-hashed with no readable module attribution, and
  this project has no bundle-analyzer tooling configured — adding one just
  for a one-time measurement would itself be exactly the kind of
  speculative dependency addition that pass's brief explicitly warned
  against. Without a way to attribute a specific oversized chunk to
  `ScrollShowcaseSection`/the admin upload UI (the two plausible
  candidates named below), the responsible conclusion is **no dynamic-
  import change** — per that brief's own instruction not to add
  code-splitting "because it sounds like an optimization" without verified
  import-boundary evidence. If this is revisited later, install a bundle
  analyzer first and let its output name the actual chunk to split, rather
  than guessing from the two candidates below.
- The most plausible future candidates for a `next/dynamic` split, if
  proper bundle-analyzer evidence ever justifies one: the `motion`-driven
  `ScrollShowcaseSection` (not needed until a visitor scrolls that far down
  the homepage) and the admin's Cloudinary upload UI (only needed on entity
  edit pages, not the list pages that link to them).

## 7. SEO / discoverability

No `app/sitemap.ts` or `app/robots.ts` exists (Next's file-convention
routes for both — checked via `Glob`, no matches). `generateMetadata`/static
`metadata` exports are used correctly throughout for per-page titles/
descriptions/OpenGraph (`app/(site)/layout.tsx` sets the site-wide defaults,
individual pages override `title`). Adding both files is a small, contained,
no-risk addition — `sitemap.ts` can reuse the same `generateStaticParams`
product/collection lists that already exist for `/product/[slug]` and
`/collections/[slug]`.

## 8. Sign-in / navigation perceived latency (root-caused during the hardening pass)

Not covered in the original version of this audit — added after the
brief's explicit request to root-cause "clicking Sign In can take a few
seconds" rather than guess.

- **`/account` had no `loading.tsx`** (only `shop`, `product/[slug]`,
  `collections/[slug]` did). It's a fully dynamic route (`ƒ` — reads the
  session), so navigating to it from anywhere else on the site gave zero
  instant feedback on click. Fixed: added `app/(site)/account/loading.tsx`,
  a skeleton matching the page's real layout (title + four accordion-row
  placeholders), following the exact pattern `shop/loading.tsx` already
  established.
- **The real bug**: `components/account/auth-forms.tsx`'s
  `useAuthSuccessSync` called `router.push("/account")` immediately
  followed by `router.refresh()` after a successful sign-in — but the form
  already lives on `/account`. Traced precisely against Next 16's own
  documented Server Action revalidation model (`node_modules/next/dist/
  docs/01-app/02-guides/server-actions.md`): "Setting or deleting a cookie
  automatically re-renders the current page." `signIn`'s call to
  `supabase.auth.signInWithPassword` sets the session cookie via
  `cookies().set()` (`lib/supabase/server.ts`), which means the action's
  own response **already carries a fresh, signed-in render of `/account`**
  in the same round trip `useActionState` consumes — confirmed by this
  exact reasoning already present in this codebase's own
  `signUpWithMobile` comment for a different case. The subsequent
  `push()` (a no-op — already the current URL) + `.refresh()` was a fully
  redundant **second** server round-trip, doubling the wait between
  clicking "Sign In" and seeing the account view. Fixed by removing both
  calls — the local cart/wishlist/auth-flag syncing in the same effect is
  untouched. Verified: build succeeds, `/account` still renders the
  sign-in form correctly, and `AccountAuthForms` is confirmed (via a
  codebase-wide grep) to only ever be rendered from `/account` itself, so
  there's no other call site where the removed navigation was load-bearing.
  Live click-through in an actual browser wasn't possible in this
  environment (no browser-automation tool available this session) — this
  conclusion rests on precise doc-grounded code tracing, not a network-tab
  observation; a manual click-through is worth doing to visually confirm.

## What's already good — don't regress these

- Tag-based `unstable_cache` + matching `revalidateTag` on every admin
  mutation, applied consistently across every content type including the
  newest ones.
- `coupons.ts` correctly left uncached — don't "fix" this by adding a cache
  to it later without re-deriving why it's excluded.
- Cloudinary-delegated image transforms, never double-optimized through
  Next's own image proxy.
- Self-hosted fonts with `display: swap`, weight lists trimmed to what's
  actually used.
- Parallelized multi-fetch pages (`Promise.all`, not sequential `await`).
- React Compiler enabled on top of code already written to its rules —
  don't add manual `useMemo`/`useCallback`/`React.memo` on the assumption
  it's still needed; let the compiler do that work.
- Sign-in no longer pays for a redundant second server round-trip after the
  action's own response already carries the fresh signed-in render —
  don't re-add a `router.push`/`refresh()` pair on `/account`'s own forms
  without re-deriving why the automatic re-render already covers it.
