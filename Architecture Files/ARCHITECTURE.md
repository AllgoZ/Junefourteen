# JUNEFOURTEEN — Project Architecture

**Read this file first.** It is written to be the single document a new chat
session (with zero prior context) needs to become productive on this project
immediately — what it is, how it's built, where things live, why key decisions
were made, and what's outstanding. When you make a significant architectural
change, update this file in the same session.

---

## 1. What this is

A **production e-commerce platform** for JUNEFOURTEEN, a premium women's
ethnic-contemporary fashion brand. Black/white/warm-canvas editorial design
system, full shopping flow (browse → filter → product detail → custom sizing →
cart → checkout), real Supabase Postgres/Auth/RLS behind the storefront,
Cloudinary-hosted product imagery, and a separate `/admin` CMS. Started as a
frontend-only prototype and was converted to this in one large session — see
§13 for the full backend build and §21 for what's still explicitly out of
scope (payment gateway, real shipping API). Built end-to-end by Claude across
many sessions in this repo, from an empty directory.

- **Brand name**: `JUNEFOURTEEN` (was briefly "ANTARA" during early development —
  fully renamed, see §9). Single source of truth: `lib/config/site.ts`. Never
  hardcode the brand name as a literal string anywhere — always
  `site.name`/`site.description`/etc.
- **Tagline**: "Quietly Bold" (`site.tagline`) — no longer displayed as visible
  page copy anywhere (it was removed from both the hero overlay and the
  footer, see §12 steps 11 and 12); it still backs `<title>`/meta descriptions
  via `app/(site)/layout.tsx`.
- **Repos** (both pushed to, see §12 step 13): primary is
  https://github.com/AllgoZ/Junefourteen.git (git remote `origin`, branch
  `main`). A second mirror lives at
  https://github.com/AllgoZ/junefourteensite.git (git remote `site-repo`
  locally) — that repo had unrelated pre-existing content (a README,
  `index.html`, logo assets) that was force-pushed over at the user's explicit
  request, so it now carries the exact same history as `origin`. Only
  commit/push when the user explicitly asks — it hasn't been treated as
  auto-commit-on-change; when asked, push to both remotes if the intent is to
  keep them in sync (confirm with the user which remote(s) they mean if it's
  ambiguous).

## 2. Tech stack (exact versions, check `package.json` if this drifts)

- Next.js **16.3.0**, App Router, Turbopack
- React **19.2.8**
- TypeScript **5**
- Tailwind CSS **4** (CSS-first config via `@theme` in `app/(site)/globals.css`, no
  `tailwind.config.js`)
- shadcn/ui — Radix base (`-b radix`), "Nova" preset. `components.json` at repo
  root. Primitives live in `components/ui/`.
- lucide-react **1.31.0** — **v1 dropped all brand/logo icons** (Instagram,
  Facebook, etc. don't exist as imports anymore; social links in the footer use
  short text monograms "IG"/"FB" instead).
- No state library (no Redux/Zustand/Jotai) — plain React Context +
  `useSyncExternalStore` over a tiny custom store, see §6.
- **`motion` (Framer Motion's successor package, imported from `motion/react`)**
  — used narrowly for the handful of places CSS transitions genuinely can't do
  cleanly: the PDP mobile sticky purchase bar's enter/exit
  (`add-to-bag-panel.tsx`), the PDP gallery's active-image crossfade
  (`product-gallery.tsx`), cart line-item add/remove (`cart-line-item.tsx`),
  the wishlist-heart tap pulse (`wishlist-button.tsx`), and the homepage
  scroll showcase (`scroll-showcase-section.tsx` — `useScroll`/`useTransform`
  for the Black Edit chapter's own scroll-linked `backgroundColor` morph, plus
  `whileInView`/`onViewportEnter` to drive the desktop sticky image panel's
  crossfade as product rows scroll past — see §10). **Not** used for the
  product-card hover animation (plain CSS via Tailwind v4's `scale-*`
  utility — see §10) and **not** used for the hero carousel — that's native
  horizontal scroll-snap (`overflow-x-auto` + `snap-x-mandatory`) driven by
  imperative `scrollTo()` calls, no `motion` involved (see §10). Still not
  used for generic section-level scroll-reveal beyond the showcase component.
- No form library — plain controlled inputs + hand-written validation
  (`lib/validation.ts`), extended in the backend build for auth/address forms
  — still no zod/react-hook-form.
- **`@supabase/supabase-js` + `@supabase/ssr`** — Postgres, Auth, Storage-free
  (images live in Cloudinary, not Supabase Storage). See §13.
- **`cloudinary`** (server-only Node SDK) — product/collection image upload
  from the admin CMS. See §17.
- **`server-only`** — guards `lib/supabase/admin.ts` and
  `lib/cloudinary/admin.ts` so the service-role key and API secret can never
  end up in a client bundle; throws unconditionally outside Next's bundler, so
  the one-off scripts under `supabase/scripts/`/`supabase/seed/` use their own
  duplicate, guard-free client constructors
  (`supabase/scripts/shared/admin-clients.ts`) instead of importing those.
- Dev-only: **`pg`** (migration runner, direct Postgres connection) and
  **`tsx`** (runs the migration/seed/admin-bootstrap scripts without a build
  step) — see §13.

**This is intentionally a light dependency footprint.** If you're about to
`npm install` something, check whether the existing patterns already cover it
first — `motion` above and the Supabase/Cloudinary packages are the deliberate
exceptions, each added for a specific, named purpose, not swapped in
wholesale.

## 3. Running it

```bash
npm install
npm run dev      # Turbopack dev server, http://localhost:3000
npm run build    # production build (also type-checks)
npm run lint     # ESLint — includes React Compiler rules as hard errors, see §9.2
npm run start    # serve the production build
```

There's no test suite. Verification throughout this project has been:
`tsc --noEmit` + `npm run lint` + `npm run build` all clean, plus ad-hoc
Playwright scripts (installed to a scratch dir, not a repo dependency) driving
the dev server headlessly to screenshot pages, click/scroll through flows, and
— since the backend build (§13) — exercise real Supabase/Cloudinary round
trips (sign up, sign in, cart/wishlist merge, checkout, admin CRUD) across
viewports (360/390/414/430/768/1024/1280/1440/1920px). No CI is configured.

Local dev needs `.env.local` populated (see `.env.example` for the variable
list) — without it, every Supabase-backed page throws at request time. See
§20 for how to get real values and apply migrations/seed data to a fresh
Supabase project.

## 4. Repository structure

```
app/
  (site)/                    The entire storefront — its own root layout (own <html>/<body>,
                              CartProvider/WishlistProvider/SiteHeader/SiteFooter), see §17 for
                              why. Route group folder name is stripped from the URL, so this
                              changes nothing about the public route table (§5).
  admin/                      Admin CMS — separate root layout, no storefront chrome. See §17.
    login/                     Not gated (would otherwise redirect to itself).
    (protected)/                requireAdmin()-gated group: dashboard, products, collections,
                                orders, customers, settings.
components/
  account/                  Sign-in/up forms, orders/addresses/profile panels, sign-out button (§15)
  admin/                    Admin nav, product/collection forms, product image manager (§17)
  cart/                     Cart drawer, line item, shipping estimator
  checkout/                 Checkout form + order summary (now wired to app/(site)/checkout/actions.ts, §16)
  home/                     Homepage sections — hero carousel, collections, scroll showcase
                             (Best Sellers + Black Edit), campaign banners, social grid
  layout/                   Container, SiteHeader, SiteFooter, MobileNav
                             (no newsletter form anymore — removed, see §12 step 12)
  marketing/                StaticPage wrapper + ContactForm (used by about/contact/legal pages)
  product/                  Product card/grid/gallery/image, size & custom-size flow, add-to-bag panel
  providers/                CartProvider, WishlistProvider (see §6, §16)
  search/                   SearchOverlay
  shop/                     Breadcrumb, FilterSheet/SortSheet (mobile), FilterBarDesktop (desktop)
  ui/                       shadcn primitives + shared atoms (EmptyState, TonalPlaceholder, EditorialImage, ...)
  wishlist/                 WishlistGrid
hooks/                      use-recent-searches.ts
lib/
  auth/                     dal.ts (verifySession/requireAdmin/getCurrentProfile),
                             client-auth-store.ts (client-side isAuthed flag, §15/§16)
  cloudinary/                admin.ts (server-only upload/delete), loader.ts (next/image custom loader, §17)
  config/site.ts            Brand config — THE place to change brand name/nav/footer links/social
  mappers/                   DB row → existing domain type (product.ts, collection.ts, cart.ts, wishlist.ts)
  mock-data/                Original mock catalog — kept as historical reference/seed source (§13), no
                             longer read by the live app (lib/services/products.ts reads Supabase now)
  repositories/              Raw Supabase queries (products.ts, collections.ts, cart.ts, wishlist.ts,
                              addresses.ts, orders.ts) + repositories/admin/* (service-role, admin-only queries)
  services/                 Same exported function names as before the backend build (getProducts(),
                             getProductBySlug(), etc. — see §13) plus new auth.ts/admin-auth.ts/cart.ts/
                             wishlist.ts/addresses.ts Server Actions
  shipping/rate-table.ts     Mock shipping rates, extracted from services/shipping.ts (still mock — §21)
  supabase/                  client.ts (browser), server.ts (cookie-bound, RLS-as-user), admin.ts
                             (service-role, server-only), anon.ts (no cookies, for cacheable public
                              reads), types.ts (hand-written Database type, §13)
  format.ts, validation.ts, storage.ts, local-store.ts, shop-filters.ts, utils.ts (cn helper)
types/                      product.ts, cart.ts, shipping.ts — shared TS types (unchanged by the backend build)
public/images/              Real dummy product photography (6 files, originals — now also mirrored into
                             Cloudinary by the seed script, see §13/§17)
supabase/
  migrations/                 Numbered SQL files, applied in order — see §14/§20
  scripts/                    run-migrations.ts, promote-admin.ts, shared/admin-clients.ts (script-local
                               Supabase/Cloudinary clients — see §13 for why they can't import lib/supabase/
                               admin.ts or lib/cloudinary/admin.ts directly)
  seed/seed.ts                 Imports lib/mock-data directly (not a hand transcription) to seed Supabase
                                + Cloudinary from the original catalog — see §13/§20
proxy.ts                    Repo root. Next 16 renamed `middleware.ts` to `proxy.ts` — see §9. Refreshes
                             the Supabase session cookie and gates /admin/* (except /admin/login).
Architecture Files/         This file.
prompt files/                Design briefs given by the user, in chronological order (see §11) — these are
                             historical/reference inputs, not live specs to re-apply. `backend.md` (the
                             production-backend brief, §13) is gitignored — it had live credentials
                             pasted in plaintext, see §13's opening note.
prompt files/reference images/  Screenshots the user attached to specific briefs (own-site screenshots showing
                             a bug, and third-party reference sites) — see §11 for which brief each set belongs to
dummy images/                Original, uncropped source photos before they were copied into public/images/
```

## 5. Routes

| Route | Purpose |
|---|---|
| `/` | Homepage — hero carousel, collections, new arrivals, scroll showcase (Best Sellers → Black Edit), closing campaign banner, social grid. No newsletter section (removed, §12 step 12). |
| `/shop` | Full catalog with filters/sort (URL-search-param driven). No heading/description copy — straight from breadcrumb to toolbar to grid (§12 step 12). |
| `/collections/[slug]` | Same shop UI pinned to one collection (`generateStaticParams` over the collections). Same no-heading-copy treatment as `/shop`. |
| `/product/[slug]` | Product detail page (`generateStaticParams` over all 18 products). |
| `/search` | Full search results page (also reachable via the header search overlay) |
| `/wishlist` | Wishlist grid + move-to-bag |
| `/cart` | Full-page cart (same `CartContent` component the drawer uses, `variant="page"`) |
| `/checkout` | Checkout shell — contact/address/delivery/payment-placeholder/order summary, no real payment |
| `/account` | Signed-out: compact sign-in/create-account tabs. Signed-in: same Accordion rows (Orders/Wishlist/Addresses/Profile), now wired to real data — see §15. |
| `/size-guide` | Standalone size chart page (same content as the in-PDP size guide modal) |
| `/about`, `/contact`, `/shipping`, `/returns`, `/faq`, `/privacy`, `/terms` | Static/marketing pages via `components/marketing/static-page.tsx` |
| `/admin/login` | Admin sign-in, not gated (the one route inside `app/admin` outside the `(protected)` group) |
| `/admin`, `/admin/products[/new,/[id]]`, `/admin/collections[/new,/[id]]`, `/admin/orders[/[id]]`, `/admin/customers`, `/admin/settings` | Admin CMS — see §17 |

`/shop`, `/collections/[slug]`, `/search`, `/account`, and everything under
`/admin` are server-rendered on demand (`ƒ` in the build output) — `/shop`
etc. because they read `searchParams`, `/account`/`/admin/*` because they read
the auth session per-request. Everything else is statically prerendered
(homepage and PDPs additionally carry an hour-long `unstable_cache` layer on
top, see §19).

## 6. State management

**Cart, Wishlist, and Recent Searches are all backed by `localStorage`** via one
shared pattern in `lib/local-store.ts`:

```ts
createLocalStore<T>(key, fallback) → { getSnapshot, getServerSnapshot, subscribe, set }
```

Consumed through React's `useSyncExternalStore` in `components/providers/
cart-provider.tsx` and `wishlist-provider.tsx` (both mounted once in
`app/(site)/layout.tsx`, wrapping the whole storefront) and in
`hooks/use-recent-searches.ts`. **This exact mechanism is unchanged by the
backend build** — it's still the single source of truth for both guest and
authenticated users; §16 explains how the authenticated case layers on top of
it rather than replacing it.

**Why not `useState` + `useEffect` hydration (the "obvious" way)?** It trips the
`react-hooks/set-state-in-effect` React Compiler ESLint rule, which
`eslint-config-next`'s `core-web-vitals` config enforces as a hard **error**, not
a warning, in this Next 16 setup. `useSyncExternalStore` sidesteps it entirely
and is also the more correct tool for "read a browser-only store safely across
SSR/CSR." See §9.2 for the full list of these lint gotchas — **if you add new
localStorage-backed state, follow this pattern, not the effect-based one, or
`npm run lint` will fail the build.**

`useCart()` exposes: `items`, `itemCount`, `subtotal`, `isOpen`/`openCart`/
`closeCart` (drawer state also lives here), `addItem`, `updateQuantity`,
`removeItem`, `clearCart`. `useWishlist()` exposes: `items`, `count`,
`isWishlisted`, `addItem`, `removeItem`, `toggleItem`.

## 7. Data architecture

**Real Supabase Postgres now, behind the exact same service functions.** The
backend build (§13) replaced the mock-array implementations with Supabase
calls but deliberately kept every exported function name, signature, and
return type in `lib/services/*.ts` identical — this is why zero UI components
needed to change for the swap:

- `lib/services/products.ts` — `getProducts(filters?)`, `getProductBySlug()`,
  `getRelatedProducts()`, `getCollections()`, `getCollectionBySlug()`,
  `getNewArrivals()`, `getBestSellers()`, `getAllCategories()`,
  `getAllSleeveOptions()`, `searchProducts()` — now backed by
  `lib/repositories/products.ts`/`collections.ts` + `lib/mappers/`, wrapped in
  `unstable_cache` (§19). `ProductFilters`-based filtering/sorting still
  happens in-memory in this file (unchanged logic) against the fetched
  product list — see §13 for why that's still the right call at this catalog
  size.
- `lib/services/shipping.ts` — `getShippingEstimate({country, state, pin})`,
  still a mock rate table (Tamil Nadu ₹100 / rest of India ₹120 / remote
  ₹150), now sourced from `lib/shipping/rate-table.ts`. `INDIAN_STATES` list
  unchanged. Real shipping-provider integration is still out of scope (§21).
- `lib/services/search.ts` — combined product + collection search, same
  signature, now queries Supabase via `getProducts()`/`getCollections()`.
- New in the backend build, not part of the original seam:
  `lib/services/auth.ts`, `admin-auth.ts`, `addresses.ts`, `cart.ts`,
  `wishlist.ts` — see §15/§16.

**Catalog**: the original 18 mock products / 5 collections, seeded into
Supabase + Cloudinary by `supabase/seed/seed.ts` (§13/§20) — same data, same
`black-edit` tagging/`isNew`/`isBestSeller` notes as before, now living in
`products`/`collections` tables instead of `lib/mock-data/*.ts` (kept as
historical reference and as the seed script's source, not read by the live
app). See §14 for the schema.

**Core types** (`types/product.ts`, `types/cart.ts`, `types/shipping.ts`):
`Product`, `ProductImage` (`{id, alt, tone, src?}`), `Collection`
(`{slug, name, description, tone, imageSrc?}`), `Size`, `SleeveOption`,
`CustomMeasurements`, `CartItem`, `WishlistItem`.

`lib/shop-filters.ts` defines `SORT_OPTIONS`, `PRICE_BANDS`, and
`parseShopSearchParams()` — the single place that turns URL search params into
the `ProductFilters` shape `getProducts()` expects. Both the mobile
`FilterSheet` and desktop `FilterBarDesktop` write to the same URL params, so
filtering logic itself is breakpoint-agnostic.

## 8. Product imagery

Real dummy photography (6 client-supplied portrait photos of models in ethnic
wear) lives in `public/images/`, originals preserved in `dummy images/` at the
repo root — **and, since the backend build, also mirrored into Cloudinary**
(`junefourteen/gallery/*`, deterministic `public_id` per file so re-running
the seed script overwrites rather than duplicates). `product_images.image_url`
in the database points at the Cloudinary delivery URL, not the local path;
`public/images/` stays as the seed script's source, which was never part of
the product catalog and so was never migrated — see §18 for the image
delivery pipeline (Cloudinary transformations, the custom `next/image`
loader). Those local-path homepage images currently trip a harmless "loader
missing width" dev-console warning under the global custom loader — not a
functional bug (confirmed by direct visual/HTTP-status testing), noted as a
follow-up in §21. The hero carousel, the "Shop Collection" campaign banner,
and the "Follow Along" social grid are now all DB-backed the same way
(`banners`/`homepage_campaign`/`homepage_gallery_images` tables, §14/§17)
with admin-uploaded Cloudinary images; each one's hardcoded local-path
version (`hero-section.tsx`'s `FALLBACK_BANNERS`, and the literal defaults in
`app/(site)/page.tsx`/`social-section.tsx`) only renders when its table has
zero rows, so the homepage never shows empty content.

Two components implement the same "real photo if present, else
placeholder" fallback **independently** (not sharing code — a known small
duplication, fine to leave as-is unless you're touching both):

- `components/product/product-image.tsx` — for `ProductImage` objects
  (`image?.src` → `next/image`, else `TonalPlaceholder` seeded by `image.tone`)
- `components/ui/editorial-image.tsx` — same pattern for non-product imagery
  (hero, collections, campaign banners, social grid), plus an
  `objectPosition` prop for biasing the crop toward faces on wide/short
  aspect ratios — see §12 step 10 for a real bug this caught (a hero banner
  cropping the subject almost entirely out of frame at 1440px+ widths; fixed
  by tuning that one banner's `objectPosition` Y value, not by changing the
  mechanism).
- `components/ui/tonal-placeholder.tsx` — the actual placeholder: a
  deterministic grayscale gradient (seeded by a 0–1 `tone` value so the same
  product always renders the same placeholder) with a centered Lucide `Shirt`
  icon. `ASPECT_CLASSES` lives here and backs every image wrapper site-wide:
  `portrait` (`aspect-[4/5]`, the fashion-photography ratio) drives the PDP
  gallery, cart/wishlist thumbnails, and search results; `gridCard`
  (`aspect-[3/4]`, slightly more elongated) is used **only** by `ProductCard`
  in grid contexts (home/shop/collections/search grids) — kept as a separate
  key specifically so tweaking grid-card proportions never ripples into the
  PDP gallery or cart/wishlist (see §10).

`lib/mock-data/gallery-images.ts` exports the 6 image paths.
`lib/mock-data/products.ts`'s `images()` helper assigns real `src` to every
product image via a **deterministic slug-hash rotation** through those 6 photos
— no per-product manual wiring needed; adding a product automatically gets a
consistent, repeatable set of real images. To add more real photography: drop
files in `public/images/` and extend `GALLERY_IMAGES` — everything downstream
(products, collections, hero, campaign banners) keeps working unchanged.

## 9. Framework/tooling gotchas hit while building this (don't re-discover these)

### 9.1 Next.js 16 / React 19
- `params` and `searchParams` are **Promises** in `page.tsx`/`layout.tsx`/
  `generateMetadata` — must `await` them. Type with the generated helpers
  `PageProps<'/route'>` / `LayoutProps<'/route'>`, not hand-rolled prop types.

### 9.2 `eslint-config-next`'s `core-web-vitals` enforces React Compiler rules as errors
- `react-hooks/purity`: don't call `Date.now()`/`Math.random()` during render.
  The subtler trap: it's not enough to compute the value *inside an event
  handler* — the handler also needs to be recognizable to the linter as one.
  A `Date.now()` call inside a **named** `const onScroll = () => {...}`
  that's later passed as `onScroll={onScroll}` got flagged, even though it's
  functionally identical to an inline handler; the fix was inlining the whole
  function directly as `onScroll={() => {...}}` in the JSX prop (see
  `hero-section.tsx`, and the already-working precedent in
  `wishlist-button.tsx`'s inline `onClick`). If you hit this error on a
  handler that already "looks" event-only, try inlining it before assuming
  the logic itself is wrong.
- `react-hooks/set-state-in-effect`: flags the classic "hydrate from
  localStorage in a `useEffect`" pattern — this is *why* §6's
  `useSyncExternalStore` store pattern exists. Also flags "reset local state
  when a prop changes" via effect — fix by resetting in the event handler that
  changes the prop instead (e.g. a Sheet's `onOpenChange`).
- These are real `npm run lint` failures, not warnings — the build is not clean
  until they're gone.

### 9.3 lucide-react v1
Dropped all brand/logo icons. Don't `import { Instagram } from "lucide-react"` —
it doesn't exist. Use text monograms or an SVG you supply yourself.

### 9.4 `shadcn@latest init` is non-interactive-hostile
Still prompts for component library (`-b radix|base|aria`) and preset
(`-p <name>`) even with `-y`. Run it as
`shadcn init -y -f -b radix -t next -p nova` from a script/agent.

### 9.5 CSS Grid: a fixed height on a grid container does not constrain its rows
A grid item with an `aspect-ratio` can grow past an explicit container height
if the grid has no explicit row template (implicit rows size to `auto`,
content-based). **Fix**: give the grid explicit row sizing (Tailwind's
`grid-rows-{n}` emits `repeat(n, minmax(0, 1fr))`) plus `min-h-0` on the
grid-item children as a second line of defense.

### 9.6 Hydration mismatch from browser extensions (e.g. Grammarly)
`data-new-gr-c-s-check-loaded` / `data-gr-ext-installed` appearing on `<body>`
in a hydration-mismatch warning is the Grammarly extension injecting attributes
before React hydrates — not a real bug. Fixed with `suppressHydrationWarning`
on the `<body>` tag in `app/(site)/layout.tsx`.

### 9.7 CSS `aspect-ratio` + a definite height computes width from the ratio, not the parent
`EditorialImage`/`TonalPlaceholder`/`ProductImage`'s shared wrapper divs all
carry a base `w-full` specifically so a definite width always wins regardless
of what height a caller supplies (`aspect-ratio` + auto width + a *definite*
height otherwise derives width from height × ratio instead of filling the
parent — shrinks the box unexpectedly). If you pass `h-full` to any of these
three components, this is why it's safe to do so.

### 9.8 A `position: sticky` header does not overlay content — it reserves its own space
Hit this making the homepage nav transparent-over-hero: `sticky` still
participates in normal document flow, so a transparent `sticky` header at the
very top of the page just reveals the plain page background behind it, not
whatever's "supposed" to be underneath. **Fix** (see `hero-section.tsx`): pull
the hero up underneath the header's reserved space with a negative top margin
matching the header's height (`-mt-14 sm:-mt-[72px]`) so the hero visually
extends up behind the header, which can then paint transparently over it
(the header's `z-40` keeps it above the photo). Don't reach for
`position: fixed` + manual spacer padding on every other page for this — the
negative-margin trick is scoped to the one section that needs it.

### 9.9 Tailwind v4's transform utilities compile to standalone CSS properties, not a composite `transform`
`scale-*`/`translate-*`/`rotate-*` utilities in Tailwind v4 emit the modern
standalone `scale`/`translate`/`rotate` CSS properties, not
`transform: scale(...)`. If you're debugging a transform utility with
`getComputedStyle(el).transform` and it stubbornly reads `"none"` even though
the class is applied and should be active, check `getComputedStyle(el).scale`
(or `.translate`/`.rotate`) instead — the utility is very likely working
correctly and the diagnostic was just checking the wrong property.

### 9.10 `middleware.ts` is deprecated in Next 16 — it's `proxy.ts` now
Same file location (repo root), same `export default function` +
`config.matcher` shape, just renamed. `node_modules/next/dist/docs/.../file-
conventions/middleware.md` is a one-line stub pointing at `proxy.md` — if you
find yourself about to create `middleware.ts` from habit, it silently won't
run under this version.

### 9.11 Next 16 caching has two separate models — check `cacheComponents` in `next.config.ts` first
The new opt-in `cacheComponents: true` ("Cache Components"/PPR) requires
wrapping every dynamic/runtime-API read in `<Suspense>`; the classic model
(`fetch` cache options, `unstable_cache`, `revalidateTag`/`revalidatePath`,
route segment config) doesn't. This repo's `next.config.ts` has no
`cacheComponents` flag, so it's on the classic model — `unstable_cache` is
what wraps the Supabase-backed catalog reads (§19). Also: **`revalidateTag`
now requires a second argument** (a stale-window profile, e.g. `"max"` —
`revalidateTag("products", "max")`) — omitting it is a `tsc` error in this
version, not just a deprecation warning.

### 9.12 `server-only` throws unconditionally outside Next's own bundler
It only becomes a no-op-vs-throw guard via webpack/Turbopack's module
aliasing; run a file that imports it through plain Node (e.g. `tsx
some-script.ts`) and it always throws, even server-side. This is why
`supabase/scripts/`/`supabase/seed/` have their own duplicate, guard-free
`createAdminClient()`/`uploadImage()` in `supabase/scripts/shared/
admin-clients.ts` instead of importing `lib/supabase/admin.ts` or
`lib/cloudinary/admin.ts` directly — those two stay `server-only`-guarded
because they *are* reachable from the Next app (admin Server Actions, order
creation) and must never end up in a client bundle.

### 9.13 A Supabase browser client's `onAuthStateChange` doesn't fire after a Server-Action sign-in
Only fires reliably for transitions the *browser* client itself performed
(e.g. a client-side `supabase.auth.signInWithPassword` call) or for
`INITIAL_SESSION` (read once, at client construction, from whatever cookie
already exists — this case *is* reliable). A sign-in done via a Server Action
+ cookie-bound server client is invisible to an already-constructed browser
GoTrueClient instance — nothing tells it the cookie changed underneath it.
Cost real time chasing a "stuck pending" bug in the guest→account cart merge
before landing on the fix: do the merge **inside** the sign-in/sign-up Server
Action itself (same request, same cookie store — see §16), and have the
client apply the *returned* result directly rather than reacting to an event
that won't come. Use the listener only for `INITIAL_SESSION` (already-logged-
in-on-page-load) and `SIGNED_OUT`.

### 9.14 Supabase's *direct* Postgres host can be IPv6-only; the pooler isn't
`db.<ref>.supabase.co:5432` hung with `ETIMEDOUT` in this sandboxed dev
environment (no outbound IPv6 route, and the host had no A record to fall
back to — `dns.setDefaultResultOrder("ipv4first")` doesn't help when there's
nothing to prefer). The session/transaction **pooler** connection
(`postgres.<project-ref>@aws-0-<region>.pooler.supabase.com:5432`) resolves
over IPv4 and works. The region isn't derivable from the project ref; a quick
script trying `postgres.<ref>` auth against a handful of `aws-0-<region>`
hosts finds it fast (wrong-region attempts fail cleanly with "Tenant or user
not found," not a hang). Separately: `supabase gen types typescript --db-url`
shells out to Docker regardless of `--db-url` — with no Docker daemon
running, hand-write `lib/supabase/types.ts` against the migrations instead
(see §14 for what's in it).

### 9.15 A Server Action's route refresh only covers the route that invoked it
Companion gotcha to §9.13, but on the *server* side: after a Server Action
resolves, Next automatically re-renders the Server Components of the route
that called it — that's why `signIn`/`signUp` (`lib/services/auth.ts`) never
needed a manual revalidation, since `AccountAuthForms` only ever renders on
`/account` itself. `signUpWithMobile` is invoked from `MobileSignupDialog`,
which lives on the product page (`add-to-bag-panel.tsx`) — a completely
different route. A real bug shipped from this: after mobile sign-up, the
dialog closes (and, for "Buy Now", client-side `router.push("/checkout")`
fires), but nothing told Next that `/account` or `/checkout` needed fresh
data — a `<Link>` prefetched earlier while signed out (or the `router.push`
navigation itself) could serve an already-cached, still-signed-out render of
either page. Fixed by calling `revalidatePath("/account")` and
`revalidatePath("/checkout")` at the end of `signUpWithMobile`, once the
session/profile work is done — the general rule this leaves behind: any
Server Action that establishes a session from a route other than the one
that displays the result of being signed in must explicitly revalidate that
other route.

### 9.16 `server-only` taints the whole file it's imported into, not just the export you use
A client component importing *any* named export from a file that
transitively imports `server-only` fails the build, even if that export
itself has no server dependency — the guard isn't tree-shaken around
per-export, it throws at module evaluation. Hit when `lib/services/
shipping.ts` gained a real DB read: three client components that only ever
used its unrelated `INDIAN_STATES` constant broke. Full story and fix
(a dedicated zero-dependency `lib/config/indian-states.ts`) in §16.

### 9.17 A Server Action's request body is capped at 1MB by default
Every image upload in the admin (banners, products, collections) goes
through a Server Action carrying the file as `FormData` — any photo over
~1MB (any real, non-tiny JPG/WebP) hits `Body exceeded 1 MB limit.` This
isn't Cloudinary- or code-specific, it's a Next.js-wide default with no
per-route override; the fix is `next.config.ts`'s
`experimental.serverActions.bodySizeLimit` (still `experimental` in this
exact Next 16.3.0 install per its own bundled docs — checked rather than
assumed, since AGENTS.md warns this version's conventions can differ from
training data), set to `"10mb"` here. Requires a dev-server restart to
take effect — `next.config.ts` isn't hot-reloaded.

## 10. Design system (current baseline — see §12 for how it got here)

- **Colors** (`app/(site)/globals.css`, plain hex not oklch): `#0A0A0A` primary black,
  `#171717` secondary black (hover/emphasis), `#FFFFFF` white, `#FAF9F6` warm
  canvas (`bg-offwhite`), `#F5F5F3` soft surface (`bg-muted`), `#E7E5E2` border,
  `#6B6B6B` muted text, `#8A8A8A` subtle text. `#FFAB00` amber
  (`--color-amber`) still exists as a token but is **unused** — leave it
  defined but don't reach for it without a real reason. Two more tokens exist
  for exactly one purpose each: `--color-near-black` (`#050505`) and
  `--color-warm-white` (`#F5F2EE`) back the Black Edit chapter only (below) —
  don't reuse them elsewhere.

- **Typography**: Inter (self-hosted via `next/font/google`) is the UI sans,
  stacked behind `-apple-system, BlinkMacSystemFont`. Fraunces (serif) is
  reserved for **genuine editorial moments only** (About page, footer/nav
  historically — see below for what changed). Every heading otherwise is sans
  with `font-medium tracking-tight`.
  **Montserrat semi-bold** (`next/font/google`, weight `600` only, exposed as
  the `font-montserrat` Tailwind utility via `--font-montserrat` in
  `app/(site)/globals.css`'s `@theme inline` block) is a **third, narrowly-scoped**
  typeface used *only* for the brand wordmark "JUNEFOURTEEN" — in
  `SiteHeader` (responsive sizing `text-sm → sm:text-lg → lg:text-xl` with
  `truncate`/`whitespace-nowrap`, tuned down from an earlier larger size that
  was overlapping the header's search icon at narrow mobile widths — always
  check header text doesn't collide with the icon cluster if you touch this)
  and in `MobileNav`'s sheet header. This replaced Fraunces for the wordmark
  specifically, per direct request — don't reintroduce serif there.
  `MobileNav`'s list items (New Arrivals, Shop/About/Help accordion triggers,
  Collections, Account, Wishlist) all share one `ITEM_CLASS` constant —
  `text-xs font-medium tracking-[0.2em] uppercase` — matching the same quiet
  label style used for homepage section headings (below); nested sub-links
  inside each accordion stay plain sentence-case `text-sm text-muted-foreground`
  for a clear two-tier hierarchy.
  The hero no longer carries any headline text at all (see below) — so there
  is currently **no** deliberately-bold typographic moment on the homepage;
  if one gets added back, keep it to the hero only, per the site's
  "few large moments, otherwise quiet" typographic budget.

- **Hero** (`components/home/hero-section.tsx`) — a `h-[75dvh]` **text-free**
  banner carousel, pulled up under the header via `-mt-14 sm:-mt-[72px]`
  (§9.8) so the header can overlay it transparently. Real horizontal
  scroll-snap (`overflow-x-auto snap-x-mandatory`, same idiom as the PDP
  mobile gallery in `product-gallery.tsx`) — genuinely swipeable/draggable by
  the user, not just a timed crossfade. **Loops seamlessly**: a clone of the
  first banner is appended to the track (`SLIDES = [...BANNERS, BANNERS[0]]`)
  so there's always somewhere to scroll to past the last real slide; once the
  scroll settles on that clone (detected via a debounced check in the
  `onScroll` handler), the position is silently reset to the real first slide
  with no animation — same image, so the reset is invisible, and both
  autoplay and manual swipe can keep going "forward" indefinitely instead of
  hitting a dead stop. Autoplay (`setInterval`, 5s) calls the same
  `scrollTo()` path and backs off for one cycle after any recent manual
  scroll (tracked via a ref, not state, to avoid re-running the effect). A
  permanent top gradient scrim keeps the transparent header's white
  text/icons legible over any banner. Bottom-right corner (stacked, not
  side-by-side): a small transparent "Shop Now" link
  (`text-xs tracking-[0.2em] uppercase`, matching the same quiet-label style
  used elsewhere) sits directly above the pagination dots — both moved here
  together after the link's original top-right placement was requested to
  move down. No overlaid headline — the earlier "Quietly Bold" hero
  headline was tried, then explicitly removed per feedback; don't
  reintroduce hero copy without being asked.

- **Site nav is transparent-over-hero on the homepage only**
  (`components/layout/site-header.tsx`) — white text/icons, no
  background/blur, while `pathname === "/"` and the page hasn't scrolled past
  roughly the hero's height (`window.innerHeight * 0.7` threshold on `/`,
  vs. a `4px` threshold on every other route — this bigger threshold is what
  keeps the transparent state alive for the *whole* hero instead of
  flipping solid after a few px of scroll). Solidifies to the standard
  `bg-background/90 backdrop-blur-md` treatment on scroll, exactly like every
  other route always has. Every non-home route's header is byte-identical to
  before.

- **Collections** (`components/home/featured-collections.tsx`) — the
  homepage section is titled just "Collections" (not "Featured Collections"),
  rendered via `HomeSection`'s `compact` heading style. Tiles carry **no text
  at all** — no name/arrow overlay on the photos; accessible name lives on
  the `Link` via `aria-label` instead. A subtle `scale-105` hover zoom
  (`transition-transform duration-700`) is the one interactive affordance.
  Grid is `grid-cols-2` on mobile/tablet, `lg:grid-cols-4` at 1024px+ — there
  are exactly 4 non-black-edit collections, so desktop shows all of them in
  one row (see the responsive-grid note below). A small centered "View All"
  link sits below the grid (not in `HomeSection`'s top-right slot — this
  section doesn't pass `viewAllHref` to `HomeSection` at all).

- **Product grid is responsive by breakpoint, not fixed at every breakpoint
  anymore**: `grid-cols-2` on mobile/tablet (**deliberately locked and
  unchanged** — do not touch anything below the `lg:` breakpoint on any of
  these grids without being explicitly asked to; this was an explicit user
  instruction after a laptop-view regression, see §12 step 10), stepping up
  to `lg:grid-cols-3` (1024px+) and `xl:grid-cols-4` (1280px+). This applies
  to `components/product/product-grid.tsx` (backs `/shop`,
  `/collections/[slug]`, `/search`, PDP related-products, and homepage New
  Arrivals — one shared component, one change fixes all of them),
  `product-grid-skeleton.tsx` (kept in sync), and
  `components/wishlist/wishlist-grid.tsx` (hand-rolled grid, doesn't use the
  shared component, needs the same breakpoints applied directly if you touch
  grid density again). This *supersedes* an earlier "2 columns at every
  breakpoint, never 3 or 4" rule — that rule was correct for mobile (still
  true there) but, combined with an earlier round's very tight gaps, was
  producing ~650×850px oversized cards on real laptop/desktop screens; fixed
  after the user provided reference screenshots (a 4-across desktop grid on
  a competitor site) — see §12 step 10 for the full diagnosis.

- **Product cards** (`components/product/product-card.tsx`): quiet
  `text-xs text-muted-foreground` name text (not `text-sm text-foreground`),
  no strike-through `compareAtPrice` on grid cards (`Price`'s
  `showCompareAtPrice` prop, default `true`, set `false` only from
  `ProductCard` — PDP and cart line items still show it, that's where the
  discount context matters). Badge slot (top-left) is priority-ordered:
  `isSoldOut` → a small pill badge (`rounded-full`, white/gradient
  background, `text-destructive` red text, soft shadow) takes over the slot
  entirely; else `isNew` → plain white "New" text; else `compareAtPrice` →
  plain white "Sale" text. The overlay wishlist heart (`WishlistButton`'s
  `overlay` variant, used only from `ProductCard`) has no background circle —
  bare heart icon with a small drop-shadow for legibility over any photo; the
  PDP's `detail` variant (bordered square button) is untouched. Images use
  the `gridCard` aspect ratio (§8) and a **subtle hover-scale animation**
  (`transition-all duration-500 ease-out group-hover:scale-[1.03]` on the
  `ProductImage`) — small enough to read as "premium," not a gimmick; if you
  go checking whether it's actually applying, remember §9.9 (check
  `getComputedStyle(el).scale`, not `.transform`).

- **Homepage scroll showcase** (`components/home/scroll-showcase-section.tsx`)
  — Best Sellers leading into Black Edit, two structurally **separate**
  pieces inside one file:
  - `ShowcaseChapter` (Best Sellers): plain, white, **not** scroll-linked or
    animated in any way — a normal `HomeSection` with `compact` heading. On
    `lg:` and up it renders a desktop-only sticky "follow along" layout
    (pinned product image in a capped-width left column,
    `lg:grid-cols-[minmax(0,380px)_1fr] xl:grid-cols-[minmax(0,420px)_1fr]` —
    capped rather than a 50/50 split so the pinned image can't grow past a
    sane size on wide screens, see §12 step 10 — with a scrolling list of
    name+price rows on the right; each row is a `motion.div` with
    `viewport={{ margin: "-45% 0px -45% 0px" }}` + `onViewportEnter` setting
    which row is "active," and the pinned image `AnimatePresence`-crossfades
    to match). Below `lg:`, no pinning — just the standard `<ProductGrid>`.
  - `BlackChapter` (Black Edit): its **own** near-black environment with its
    **own** `useScroll` ref scoped only to itself (`offset: ["start end",
    "end start"]`, `backgroundColor` interpolated across
    `[0, 0.15, 0.85, 1]` → offwhite/near-black/near-black/offwhite). This is
    deliberately *not* a shared morph across both chapters anymore — an
    earlier version tied the white→black transform to the combined
    container's overall scroll progress with hardcoded percentage stops,
    which meant the black tint's timing depended on how tall Best Sellers
    happened to render, and it was visibly starting *during* Best Sellers'
    scroll (reported twice). Scoping the ref to just the Black Edit subtree
    makes that structurally impossible — the color can only ever start
    shifting once Black Edit's own content begins. It opens with a big,
    bold, centered "new page" typographic moment (`text-6xl sm:text-7xl
    lg:text-8xl` "Black Edit" + a small "The Edit" label + "View All" link) —
    this doubles as the section's own heading, so `HomeSection` isn't used
    here at all. Same capped-width sticky-panel / row-list pattern as Best
    Sellers on `lg:`+, plain `<ProductGrid dark>` below `lg:`.
  **Known content gap** (unchanged): none of the 6 real dummy photos (§8) are
  black garments; the 4 `black-edit`-tagged products are real in-stock,
  deep-toned pieces, not actually black — the section's *environment* and
  scroll mechanics are genuinely implemented, the photography inside is
  still a placeholder for real Black Edit photography.

- **No newsletter anywhere on the site.** The homepage's "Stay in the Loop"
  section (`components/home/newsletter-section.tsx`) and the footer's inline
  signup form (`components/layout/newsletter-form.tsx`) were both deleted
  entirely, per direct feedback — along with the footer's "Quietly Bold."
  tagline text that sat next to that form. Don't re-add a newsletter
  component without being asked; if email/mobile capture comes back later,
  it's a fresh build, not a revert.

- **`/shop` and `/collections/[slug]` have no heading/description copy** — no
  "Shop All" H1, no "The full JUNEFOURTEEN edit — handloom textiles..."
  paragraph (and the equivalent per-collection name + description on
  `/collections/[slug]`). Both pages now go straight from `Breadcrumb` to
  `ShopToolbar` to the grid. Breadcrumb, product count, filters, and sort are
  all untouched — this was specifically about the marketing-copy block, not
  functional page chrome.

- **Layout grid**: `components/layout/container.tsx` is the single source of
  horizontal boundaries — `max-w-[1440px]` default, `size="form"` (5xl,
  checkout), `size="medium"` (3xl), `size="narrow"` (2xl, cart/account/static
  pages), all sharing the same `px-4 sm:px-8 lg:px-12` gutter scale. A few
  homepage sections (Collections, New Arrivals) intentionally use a *tighter*
  custom gutter on mobile (`px-1`/`px-2`) instead of `Container` directly, to
  make the locked 2-column mobile grid read as large as possible — don't
  "fix" this back to the standard gutter, it's deliberate.
- **Radius**: base `--radius: 0.75rem` (12px) driving `--radius-sm/md/lg/xl/2xl`.
  Bottom sheets (`FilterSheet`, `SortSheet`) use a larger `rounded-t-[1.75rem]`
  top radius + a `SheetDragHandle` component for the iOS feel.
- **Elevated CTAs**: `components/product/add-to-bag-panel.tsx` defines
  `PRIMARY_CTA`/`SECONDARY_CTA`/`STICKY_CTA` Tailwind class constants — taller
  (`h-14`/`h-12`), `rounded-2xl`, layered box-shadow, `active:scale-[0.97]`
  press feedback. Scoped to just Add to Bag / Buy Now, not a global `Button`
  variant.
- **Empty states**: `components/ui/empty-state.tsx` is typography-first — no
  icon-in-a-circle. Just a headline + one line + CTA.
- **Shop filters split by breakpoint**: `components/shop/filter-bar-desktop.tsx`
  (Popover-per-facet horizontal bar, immediate-apply) for `lg:` and up;
  `FilterSheet`/`SortSheet` (staged draft + Apply, bottom sheet) for mobile. Both
  write the same URL params.
- **Shipping estimator**: collapsed-by-default disclosure row inside the cart
  (`components/cart/shipping-estimator.tsx`).
- **No horizontal scroll-snap *product* rails anywhere on the site** (PDP
  related-products, New Arrivals, Best Sellers all render a plain, capped
  `<ProductGrid>`) — this was a hard, repeatedly-stated requirement; don't
  reopen it. The hero's own scroll-snap carousel (above) is a deliberate,
  narrow exception scoped to the hero banners specifically, not a product
  rail.
- **Homepage no longer explains the brand.** The "Our Philosophy"/"Our Story"
  content lives on `/about` (`#philosophy`/`#story` anchors) only — don't add
  brand-storytelling copy back to the homepage.

## 11. Source documents in `prompt files/` — what each one is

These are the user's design briefs, kept for reference/history, in
chronological order. **They are not live specs to keep re-applying** — treat
them as inputs that already shaped the current code (§12).

- `initialize.md` — the original from-scratch build brief (v1). Fully implemented.
- `v2.md` — "looks like a generic AI-generated template" redesign brief.
  Fully implemented — most of what §10 describes structurally (Container,
  typography discipline, etc.).
- `redesignv2.md` — a "photography-first" redesign brief (always-2-column
  grid at the time, minimal text, amber accent used sparingly). Fully
  implemented; Zustand was requested but deliberately not added (existing
  `useSyncExternalStore` pattern already satisfied the intent).
- `redesignv3.md` — a "master" redesign spec overriding `redesignv2.md`'s
  homepage direction specifically. Killed remaining horizontal carousels,
  stripped the hero to zero text (later revisited, see below), added the
  original standalone Black Edit section, restructured the mobile nav into
  Accordion groups.
- `rawprompt.md` — a homepage brief: 3/4-screen hero carousel, text-free
  Collections tiles, quieter New Arrivals, and a scroll-driven white→black
  chapter into Black Edit. The user then asked for a Versace-leaning styling
  direction (huge bold hero typography, transparent-over-hero nav) over a
  denser marketplace alternative — chosen after live-fetching the named
  reference sites failed and the user was asked directly which direction to
  lean.
- `rawlaptopview.md` + attached screenshots — reported the desktop/laptop
  layout as "totally trash" (oversized 2-column grids, a bad hero-banner
  crop) while explicitly demanding mobile stay untouched. Some of the
  attached "reference images" turned out to be screenshots of *this site's
  own* desktop view showing the bug, not third-party references — worth
  double-checking what a screenshot actually shows before treating it as
  purely aspirational reference. Resolved by making product/collection grids
  responsive (§10) while leaving every mobile/tablet class byte-identical.
- After `rawlaptopview.md`, the remaining changes (hero headline removal,
  header-transparency bug fix, hero loop, Montserrat typography, newsletter
  removal, `/shop`/`/collections` copy removal, product-card hover animation)
  came as a series of short, direct follow-up instructions rather than named
  brief documents — see §12 steps 11–12 for what each one changed.

## 12. Project history (chronological — why things are the way they are)

1. **Initial build** (`initialize.md`) — scaffolded Next.js from an empty repo,
   built the full v1 prototype under the brand name "ANTARA."
2. **v2 visual redesign** (`v2.md`) — presentation-only overhaul: color
   tokens, typography discipline, the `Container` component, desktop popover
   filter bar vs. mobile sheets, list-row account page.
3. **Rebrand + real imagery** — ANTARA → JUNEFOURTEEN; wired in 6 real dummy
   product photos (§8); "iOS elevated" Add to Bag / Buy Now styling.
4. **Git init + push** — repo initialized and pushed to
   https://github.com/AllgoZ/Junefourteen.git (`main`).
5. **Hydration warning fix** — `suppressHydrationWarning` for a
   Grammarly-extension false positive (§9.6).
6. *(This file created.)*
7. **`redesignv2.md` implemented** — 14→18-product catalog, 2-column grid
   at every breakpoint at the time, quiet card badges, trimmed hero/footer
   copy, added the `motion` package for four scoped animations. Fixed the
   `aspect-ratio` + definite-height CSS bug (§9.7).
8. **`redesignv3.md` implemented** — deleted the horizontal `product-rail.tsx`
   everywhere, stripped the hero to zero text, added the original standalone
   Black Edit section + `CampaignImage`, restructured `MobileNav` into
   `Accordion` groups.
9. **`rawprompt.md` implemented, Versace-leaning direction** — hero rebuilt
   as a crossfade banner carousel with a bold overlaid headline (a partial
   full-circle back to a pre-redesignv3 hero); `SiteHeader` gained
   transparent-over-hero behavior; Collections tiles lost all overlay text;
   New Arrivals bumped 4→6 products; `ProductCard` reworked (no
   strike-through on grid cards, quieter name text, no wishlist-heart
   circle, red "Sold Out" badge moved to the top-left slot); the standalone
   Black Edit section, `CampaignImage`, and standalone Best Sellers section
   were merged into one new `scroll-showcase-section.tsx` with a single
   scroll-linked background morph across both chapters.
10. **`rawlaptopview.md` desktop/laptop fix, mobile explicitly locked** —
    diagnosed and fixed the oversized-desktop-grid bug: `ProductGrid` (+
    skeleton + `WishlistGrid`) gained `lg:grid-cols-3 xl:grid-cols-4`;
    `FeaturedCollections` gained `lg:grid-cols-4` and its gutter was widened
    back from an over-tightened `lg:px-4` to `lg:px-12`; the scroll
    showcase's sticky panel changed from a 50/50 column split (growing to
    ~850px tall on wide screens) to a capped-width column
    (`minmax(0,380px)`/`420px`) with the aspect ratio switched back to
    `portrait` from the taller `gridCard`. Also found and fixed a bad hero
    banner crop (the `model-cream-anarkali-blue-wall` banner was showing
    mostly empty wall with the subject's face cut off at wide viewports —
    tuned that one banner's `objectPosition` Y value; the other three
    banners were already fine). Verified mobile/tablet were byte-identical
    afterward by diffing computed `grid-template-columns` at 390px/768px
    against the pre-fix state, not just eyeballing screenshots.
11. **Hero + nav polish, several short follow-ups** — removed the bold
    overlaid hero headline entirely (feedback on the earlier Versace-leaning
    treatment); discovered and fixed a real bug where the "transparent
    header" was actually just invisible on blank page background, because
    `position: sticky` doesn't overlay content the way `fixed` does (§9.8) —
    fixed by pulling the hero up under the header via negative margin, and
    by widening the homepage's "stay transparent" scroll threshold from 4px
    to roughly the hero's height so it doesn't flip solid almost
    immediately. Rebuilt the hero as a real horizontal scroll-snap carousel
    (manually swipeable, not just autoplay) and later gave it true seamless
    looping via a cloned first slide + silent scroll reset (see §10). The
    Black Edit chapter was, for a time, pulled out into its own standalone
    section and the homepage reordered to Collections → Black Edit → banner
    → New Arrivals → Best Sellers (plain) — that reorder was later reverted
    (by the user/environment) back to the Collections → New Arrivals →
    ScrollShowcaseSection(Best Sellers → Black Edit) → CampaignImage → Social
    order that's current today (§5, §10); when the "black tint starts too
    early" bug resurfaced afterward, it was fixed *within* the reverted
    structure by scoping Black Edit's scroll ref to itself rather than
    redoing the reorder (§10's `scroll-showcase-section.tsx` note) — if you
    see references to a separate `black-edit-section.tsx` file anywhere
    (including possibly stale mentions), it no longer exists; Black Edit
    lives inside `scroll-showcase-section.tsx` as `BlackChapter`. Also
    switched the nav wordmark to Montserrat semi-bold (tuning its size down
    after it first collided with the mobile search icon) and restyled
    `MobileNav` to match (§10 Typography).
12. **Content trim + product-card polish** — removed the newsletter feature
    entirely (homepage section, footer form, the footer's adjacent "Quietly
    Bold." text — all deleted, not just hidden); removed the heading/
    description copy block from `/shop` and `/collections/[slug]`; added the
    subtle hover-scale animation to `ProductCard` images; moved the hero's
    "Shop Now" link from top-right down to bottom-right, stacked above the
    pagination dots. Along the way, fixed one incidentally-discovered
    `react-hooks/purity` lint error in `hero-section.tsx` (§9.2's
    named-vs-inline-handler gotcha) — a pure refactor, no behavior change.
13. **Committed and pushed to two remotes** — the entire session's work
    (steps 9–12, previously all uncommitted) was committed as one commit and
    pushed to `origin` (https://github.com/AllgoZ/Junefourteen.git). The user
    then asked for the same content on a second repo,
    https://github.com/AllgoZ/junefourteensite.git — that repo had unrelated
    pre-existing content (README, `index.html`, logo assets), so after
    explicit confirmation it was force-pushed over via a second local remote
    named `site-repo`. Both remotes now point at the same commit.
14. **Production backend build** (`prompt files/backend.md`) — converted the
    frontend-only prototype into the platform §1 now describes: Supabase
    Postgres/Auth/RLS, Cloudinary image storage, a full `/admin` CMS, guest↔
    authenticated cart/wishlist merge, server-authoritative checkout/orders.
    The customer-facing storefront's HTML/CSS output is unchanged — verified
    both by direct visual comparison (see §10's screenshots-in-session
    practice) and by the fact that every component file under
    `components/product/`, `components/home/`, `components/layout/`, etc. was
    untouched; only the data layer underneath them and `app/` structure moved.
    Full details in §13–§20. The brief itself had live Supabase/Cloudinary
    credentials pasted in plaintext — `prompt files/backend.md` was
    immediately gitignored (§4) before anything else happened.

## 13. Backend architecture overview

The brief's own preferred layering is what's implemented:

```
Supabase / Cloudinary
  ↓
Repository (lib/repositories/*.ts — raw Supabase queries, admin/* subfolder
  for service-role-only admin queries)
  ↓
Mapper (lib/mappers/*.ts — DB row → the pre-existing domain types in types/)
  ↓
Service (lib/services/*.ts — same exported function names/signatures as the
  original mock-data seam, see §7)
  ↓
UI (unchanged)
```

Four Supabase client constructors, each for a different trust level —
**picking the wrong one is the most common mistake to make in this layer**:

- `lib/supabase/client.ts` — browser client (publishable key). Client
  Components only.
- `lib/supabase/server.ts` — cookie-bound (`next/headers` `cookies()`),
  respects RLS as the signed-in user (or anonymous). Server Components/
  Actions that need "the current user's own data" (addresses, their cart,
  their orders).
- `lib/supabase/anon.ts` — no cookies, no session, RLS as anonymous. For
  public/cacheable reads only (catalog, search) — exists specifically because
  `unstable_cache` (§19) forbids request-scoped APIs like `cookies()` inside
  its callback, so the cookie-bound server client can't be used there.
- `lib/supabase/admin.ts` — service-role, bypasses RLS entirely. Only inside
  code that has already verified the caller is authorized: admin Server
  Actions (after `requireAdmin()`, §15) and order creation (§16, after its
  own server-computed pricing makes a raw insert safe). `import "server-
  only"` at the top — see §9.12 for why standalone scripts can't import this
  file directly and have their own duplicate in
  `supabase/scripts/shared/admin-clients.ts`.

All four share `lib/supabase/types.ts` — a **hand-written** (not
`supabase gen types`-generated, see §9.14) `Database` type kept in sync with
`supabase/migrations/*.sql` by hand. If you add/change a column, update both.

**Why in-memory filtering, not per-filter SQL, in `getProducts()`?** The
catalog is ~18 products. `lib/repositories/products.ts#listActiveProducts()`
fetches all active products in one nested-select round trip (images, sizes,
sleeve options, collection membership — no N+1), and `lib/services/
products.ts` runs the exact same `ProductFilters` filter/sort chain that
existed before the backend build, just against that fetched array instead of
the mock one. Encoding every filter (collection, size, sleeve, price band) as
PostgREST embedded-resource filter syntax would be more "correct" at scale
but meaningfully more complex and risky to get exactly equivalent to the
existing, UI-facing filter semantics — revisit this if the catalog grows past
a few hundred products.

## 14. Database schema & RLS

Twenty tables, all in `supabase/migrations/0001_schema.sql` (+ `0002_
triggers.sql`, `0003_rls.sql`, `0004_lockdown_internal.sql`, `0005_profile_
email.sql`, `0006_banners.sql`, `0007_social_links.sql`, `0008_inventory.sql`,
`0009_banner_mobile_image.sql`, `0010_banner_content_fields.sql`,
`0011_order_tracking.sql`, `0012_order_payment_fields.sql`,
`0013_shipping_coupons_tax.sql`, `0014_homepage_media.sql` — `0008`/`0011`/
`0012` are plain `alter table` additions with no new table, `0009` renames
`banners`' original image columns to `desktop_*` and adds a parallel optional
`mobile_*` set, `0010` adds banners' optional overlay-copy columns, `0013`
adds `shipping_zones`/`coupons`/`tax_settings` plus `orders.tax_amount`/
`coupon_code`, `0014` adds `homepage_campaign`/`homepage_gallery_images` and
seeds both with the exact values the homepage had hardcoded before). One
deliberate
deviation from the backend brief's suggested
shape: **`product_collections` is a many-to-many join table**, not a single
`collection_id` FK on `products` — the mock data has products in multiple
collections at once (e.g. `handloom-kurta-set` is in both `handloom-stories`
and `everyday-edit`), which a single FK can't represent.

| Table | Notes |
|---|---|
| `profiles` | `id` = `auth.users.id`. `role` (`customer`/`admin`), `email` (denormalized copy of `auth.users.email`, added in `0005` so the admin customers list is one query — §17). Auto-created by the `handle_new_user()` trigger on signup. |
| `collections` | Matches the `Collection` type exactly, including `tone` (placeholder gradient seed) which the brief's own suggested schema omitted. |
| `products` | Matches `Product`. `category`/`tags`/`wash_care` stay flat text/`text[]` columns (no separate lookup tables) — matches how the domain type already treats them. `0008` adds `stock_quantity`/`low_stock_threshold` (both `integer not null check (>= 0)`) — deliberately independent of `is_sold_out`, which stays the sole storefront purchase-gating flag; stock is admin-visible inventory tracking only (§17), not wired to auto-disable purchasing. |
| `product_collections`, `product_images`, `product_sizes`, `product_sleeve_options` | Children of `products`, `on delete cascade`. |
| `banners` | Homepage hero carousel slides (`0006`, reshaped by `0009` and `0010`). Each row is one slide with **two independent images** — `desktop_image_url`/`desktop_image_alt`/`desktop_cloudinary_public_id`/`desktop_object_position` (the required horizontal/laptop photo) and `mobile_image_url`/`mobile_image_alt`/`mobile_cloudinary_public_id`/`mobile_object_position` (an optional, genuinely different vertical/mobile photo — not just a different crop of the desktop one; falls back to the desktop image + `mobile_object_position` when absent). Both `object_position` columns are CSS `object-position` strings (e.g. `"50% 35%"`); a manually pasted image URL (vs. a Cloudinary upload) leaves the matching `cloudinary_public_id` null. `0010` added optional overlay copy — `badge_text`, `headline` (required in the admin UI, stored `not null default ''`), `subheading`, `primary_cta_text`/`primary_cta_href` (renamed from `link_label`/`link_href`), `secondary_cta_text`/`secondary_cta_href`, `offer_badge_text` — all opt-in on the storefront (§17). Also `tone` (placeholder-gradient seed, same convention as `collections.tone`)/`sort_order`/`is_active` — multiple active rows is how the carousel gets more than one slide. Public-read policy on `is_active = true` rows, same shape as `collections`. Unlike every other admin-managed table, banners get a genuine hard delete (§17) since nothing else references a banner row. |
| `social_links` | Footer/Instagram-grid social links (`0007`) — `label`/`href`/`sort_order`/`is_active`. Replace-all-on-save from the admin (§17), not per-row CRUD. |
| `addresses`, `carts`, `cart_items`, `wishlist_items` | Owner-scoped via RLS. `cart_items` has a **partial unique index** (`cart_items_line_identity_idx`, `WHERE custom_measurements IS NULL`, keyed on `coalesce(size,'std')`/`coalesce(sleeve_option,'any')`) reproducing `cart-provider.tsx`'s `buildLineId` merge rule exactly — but see §16, the *application* merge logic (not a DB `ON CONFLICT`) is what actually enforces it, because a partial/expression unique index isn't targetable by the JS client's `upsert()`. |
| `orders`, `order_items` | `orders.user_id` is **nullable** (guest checkout is supported — checkout never gated behind sign-in). `order_number` auto-generated (`JF-<year>-<6-digit-sequence>` via a Postgres sequence). `order_items` snapshots `product_name`/`slug`/`image`/`unit_price` at order time so history stays correct if the product later changes. `0011` adds nullable `tracking_number`/`tracking_url`, admin-settable, shown to the customer once set (§16/§17). `0012` adds `razorpay_order_id`/`razorpay_payment_id` (§16). `0013` adds `tax_amount` (new) and finally wires up `discount_amount` (existed since `0001`, never used until now) + a new `coupon_code` snapshot column (§16). |
| `shipping_zones` | Admin-managed replacement for the old static rate table (`0013`) — `name`, `states text[]`, `rate`, `free_shipping_threshold` (nullable), `eta_min_days`/`eta_max_days`, `is_default` (the catch-all for any state not listed in another zone — enforced in the admin action, not a DB constraint, same as `addresses.is_default`), `sort_order`, `is_active`. RLS-enabled with **no policies** (default-deny) — only ever read/written via the service-role client (§16/§17), same reasoning as `orders`. Real hard delete (§17), same reasoning as `banners`. |
| `coupons` | `0013` — `code` (unique, stored uppercase), `discount_type` (`percentage`/`fixed`), `discount_value`, `min_order_amount`, `max_discount_amount` (nullable, caps a percentage discount), `starts_at`/`expires_at` (nullable), `usage_limit` (nullable = unlimited), `times_used`, `is_active`. Same RLS-locked-down, service-role-only, hard-delete shape as `shipping_zones`. Validated fresh on every checkout attempt (`lib/services/coupons.ts#validateCoupon`, never cached) — re-validated server-side inside `createOrderAction` regardless of what the client's earlier "Apply" preview said (§16). |
| `tax_settings` | `0013` — a **singleton row** (`id boolean primary key default true check (id)`, the standard Postgres one-row-table trick; the migration inserts that one row itself). `rate_percent`, `label`, `is_active` — one global rate, off by default. |
| `homepage_campaign` | `0014` — another **singleton row**, same trick as `tax_settings`. Backs the full-bleed "Shop Collection" banner between the Best Sellers scroll showcase and the Follow Along grid on the homepage: `image_url`/`cloudinary_public_id`/`image_alt`/`tone`, plus `link_label`/`link_href` for its single clickable CTA. Seeded with the exact values that were previously hardcoded in `app/(site)/page.tsx`. RLS-enabled with no policies (service-role client only), same as `tax_settings`/`shipping_zones`. |
| `homepage_gallery_images` | `0014` — the four photos in the "Follow Along" Instagram-style grid: `image_url`/`cloudinary_public_id`/`image_alt`/`tone`, `sort_order`, `is_active`. Seeded with the same four `GALLERY_IMAGES` paths and `TILE_TONES` values `social-section.tsx` used to hardcode. Each tile is edited independently in the admin (no add/remove/reorder UI — the storefront grid layout assumes a fixed set), same RLS-locked-down shape as `shipping_zones`. |
| `schema_migrations` | Migration-runner bookkeeping (§20), not app data — RLS-locked to deny-all via PostgREST (`0004`), reachable only by direct Postgres connection or the service-role client. |

**RLS philosophy** (all policies in `0003_rls.sql`): public `SELECT` on
`is_active = true` rows of `products`/`collections`/their children; every
customer table restricted to `auth.uid() = user_id` (or joined through
`cart_id`/`order_id`). **Deliberately no admin-role write policies** —
instead, every admin/order-creation write goes through the service-role
client (`lib/supabase/admin.ts`) from code that's already verified the caller
server-side (`requireAdmin()`/authoritative pricing). This is a narrower
security surface than "RLS policies for both customers and admins" — one
enforcement mechanism to audit instead of two that could drift apart — and
still satisfies the brief's "must be enforced server-side" requirement.
`profiles.role` additionally has its own trigger guard
(`guard_profile_role_change`) blocking any change to that column unless the
caller is the service-role — so even a compromised/buggy client-side update
can't self-promote to admin.

## 15. Authentication (customer + admin)

**Customer** (`/account`, `lib/services/auth.ts`): email/password via
Supabase Auth. This project's Supabase instance has **email confirmation
required by default** — `signUp()` doesn't return a session, and the UI shows
"check your email" rather than pretending to be signed in (see
`AuthFormState.message` in `auth-forms.tsx`). Sign-in surfaces a distinct
message for `email_not_confirmed` vs. wrong credentials.

**Admin** (`/admin/login`, `lib/services/admin-auth.ts`): same email/password
mechanism, but `adminSignIn` checks `profiles.role === "admin"` immediately
after a successful Supabase sign-in and **signs the session back out** if it
isn't — a non-admin never ends up with a lingering authenticated cookie from
an admin-login attempt. No public admin sign-up path exists; see §20 for how
the first admin gets created.

**Admin self-service credential changes** (`/admin/settings`,
`updateAdminEmail`/`updateAdminPassword` in `admin-auth.ts`): both
re-verify the current password via a fresh `signInWithPassword` before
applying anything — this is the account guarding the whole CMS, so a
left-unlocked session shouldn't be enough on its own to change its own
credentials. Password changes apply immediately (`supabase.auth.updateUser`)
and keep the current session valid. Email changes go through Supabase's
"secure email change" (confirmation links sent to both the old and new
address; the UI says so) — like every other email Supabase Auth sends on
this project, that's subject to the same low built-in rate limit noted in
§20/§21 (hit directly while testing this feature, confirmed via a raw
`updateUser` call — `over_email_send_rate_limit`, not a code bug — before the
error-message branch for it was added).

**`lib/auth/dal.ts`** (Data Access Layer, React `cache()`-memoized):
`verifySession()` (returns the user or `null`, doesn't redirect —
`getUser()`, not `getSession()`, so the JWT is actually re-validated against
Supabase, not just trusted from the cookie), `getCurrentProfile()`,
`requireUser()`/`requireAdmin()` (redirect on failure — for gated pages/
actions). Every admin Server Action calls `requireAdmin()` itself, even
though `proxy.ts` already blocks unauthenticated/non-admin requests to
`/admin/*` at the edge — actions are reachable by direct POST, not just
through the gated page (brief's explicit "not just hiding links"
requirement).

`proxy.ts` (repo root, §9.10) refreshes the Supabase session cookie on nearly
every request and, for `/admin/*` paths other than `/admin/login`, does one
extra `profiles.role` lookup to redirect non-admins to `/admin/login?
error=unauthorized` before any page code runs. That extra DB round-trip in
proxy is a deliberate, narrow exception to "keep proxy cheap" — `/admin` is a
small, non-prefetched, authenticated-only area, unlike the rest of the site.

## 16. Cart, wishlist & checkout backend

**Guest path is completely unchanged** — `createLocalStore`/
`useSyncExternalStore` (§6) still owns `useCart()`/`useWishlist()`'s state
end to end when signed out, same as before the backend build.

**Authenticated path layers on top, doesn't replace it.** `CartProvider`/
`WishlistProvider` additionally track a small module-level `isAuthed` flag
(`lib/auth/client-auth-store.ts` — plain mutable value + subscriber set, same
shape as `createLocalStore` but for one ephemeral boolean, not persisted).
When `isAuthed`, every mutation (`addItem`/`updateQuantity`/`removeItem`/
`clearCart`) still updates the local store optimistically (identical, instant
UI) **and** fires the matching Server Action (`lib/services/cart.ts`/
`wishlist.ts`) in the background; on that action's resolution the local store
is silently overwritten with the authoritative server state (self-healing
reconciliation — see the code comment in `cart-provider.tsx` for the one
narrow edge case this doesn't cover: editing a just-added line within the
same round trip window).

**Guest→account merge happens inside the sign-in/sign-up Server Action
itself**, not via a client-side auth listener — §9.13 explains why the
listener approach doesn't reliably fire here. `AccountAuthForms` renders
hidden fields carrying the current guest cart/wishlist snapshot at submit
time; `signIn`/`signUp` merge them into the (now-authenticated) account
server-side and return the merged result directly in `AuthFormState`, which
the client applies to the local store before navigating. `INITIAL_SESSION`
(fired once, reliably, when the browser Supabase client is first constructed
with an existing session already in cookies) covers the "already logged in,
fresh page load" case by fetching-and-overwriting instead — never merging on
that path, to avoid double-adding quantities on every page refresh.

**Checkout** (`app/(site)/checkout/actions.ts#createOrderAction`): re-fetches
live prices for every cart line's `product_id` via `lib/repositories/
products.ts#getProductsForPricing()` — **the client-supplied price/subtotal/
total on the cart is never read for the order total**, only `productId`/
`quantity`/`size`/`sleeve`/`customMeasurements`. Rejects if a product is
inactive or sold out. Computes shipping via the untouched `getShippingEstimate`
(§7). Inserts `orders`+`order_items` via the admin client (no client-writable
RLS policy exists for these tables — §14), `payment_status`/`status` both
start `"pending"` (no payment gateway exists, so nothing is ever marked paid
by this code path — §21). `checkout-content.tsx`'s "Place Order" button
(previously just a toast) now calls this action and, on success, swaps the
form for an inline order-confirmation state — the only UI change this step
required, per the brief's "only touch the UI when connecting real
functionality requires it."

**Address reuse at checkout.** `addresses` (§14) already had a full CRUD
panel on `/account` (`AddressesPanel`, `lib/services/addresses.ts`'s
`addAddress`/`deleteAddress`) but checkout never looked at it — every
checkout started from a blank form. `app/(site)/checkout/page.tsx` now
fetches `listAddressesForUser` for a signed-in visitor and passes it to
`CheckoutContent`, which renders a "Use a saved address" `Select` above the
Shipping Address fields (picking one just fills the same controlled
`form` state — no new form fields, no change to manual entry) and, only
when signed in, a "Save this address for next time" checkbox (checked by
default). `createOrderAction` gained one additive optional parameter,
`{ saveAddress?: boolean }` — after the existing order/cart-clear logic
(untouched), it saves the address via a new `lib/repositories/
addresses.ts#createAddressForUser` (the same insert shape `addAddress`
already builds, extracted so checkout doesn't depend on that action's
FormData/`"use server"` contract; `addAddress` itself is unmodified). A
user's first saved address becomes their default automatically, matching
`AddressesPanel`'s own "first address" UX; later ones never silently
override an existing default. The save step is wrapped in a `try/catch` —
it's best-effort, since the order is already placed by that point and a
failure here shouldn't turn a successful checkout into an error. Verified
directly against the live database with a throwaway test account (not just
type-checked): first address → `is_default: true`, second → `false`.

**Customer order detail page.** New `app/(site)/account/orders/[id]/page.tsx`
reuses the already-existing `getOrderWithItems` (`lib/repositories/
orders.ts`) with the cookie-bound client — RLS (`orders_owner_select:
auth.uid() = user_id`, §14) means this returns `null` both for a
nonexistent order and for one that belongs to someone else, and the page
calls `notFound()` on that either way rather than distinguishing the two
(never confirm/deny that a given order id exists to a non-owner). Verified
directly against the database with two throwaway accounts: the owner reads
their order fine, a second signed-in account gets `null` for the same id.
`OrdersPanel` on `/account` now links each row to this page instead of
rendering a plain `<li>`.

**Order tracking** (`0011_order_tracking.sql`): `orders` gains nullable
`tracking_number`/`tracking_url`. Admin's order detail page
(`app/admin/(protected)/orders/[id]/page.tsx`) gets a new, separate
"Tracking" `AdminCard` (own form, own `updateOrderTrackingAction`/
`updateOrderTrackingForAdmin`) — the existing Status card and
`updateOrderStatusAction` are untouched. The customer order detail page
shows a "Shipment Tracking" block once either field is set: a clickable
link when `tracking_url` exists (label = `tracking_number` if also set,
else "Track Package"), or just the plain number if only that's set: every
order created before this migration renders exactly as it did before
(nothing shows).

**Payment (Razorpay, `0012_order_payment_fields.sql` adds `orders.razorpay_
order_id`/`razorpay_payment_id`, both nullable).** Replaces the old
"Payment integration coming soon" placeholder. `lib/payments/razorpay.ts`
(`server-only`) — lazy singleton client (same pattern as `lib/cloudinary/
admin.ts`), `createRazorpayOrder(amountInRupees, receipt)`, and
`verifyRazorpaySignature(orderId, paymentId, signature)` (HMAC-SHA256 of
`"<order_id>|<payment_id>"` with the key secret, compared via
`crypto.timingSafeEqual` — not `===` — to avoid a timing side-channel).
`lib/payments/razorpay-client.ts` is the client-safe half: `loadRazorpay
Checkout()` injects Checkout.js (`https://checkout.razorpay.com/v1/
checkout.js`) lazily, only when a visitor is actually about to pay, plus
the `Window.Razorpay` type declaration.

Flow (`app/(site)/checkout/actions.ts`): `createOrderAction` still creates
the `orders`/`order_items` rows exactly as before (`status`/`payment_status`
both default `"pending"`) but **no longer clears the cart** — it also
creates a matching Razorpay order and returns its id + the key id (read
fresh from `process.env.RAZORPAY_KEY_ID` per request; this value isn't a
secret, so returning it from a Server Action rather than a `NEXT_PUBLIC_`
env var was a deliberate choice — avoids ever needing to expose it as a
build-time public var). `checkout-content.tsx` then opens Checkout.js with
that order id; its `handler` callback posts the resulting `razorpay_
payment_id`/`razorpay_signature` to a new `verifyRazorpayPaymentAction`,
which is **the only place an order is ever marked paid** — it checks the
signature first and rejects anything that doesn't verify (never trusts a
client-reported "success" alone), then double-checks the order's stored
`razorpay_order_id` actually matches the one being verified (replay/
cross-order protection), then calls `markOrderPaid` (`payment_status:
"paid"`, `status: "confirmed"`) and only *then* clears the cart. If the
visitor dismisses the Checkout.js modal without paying, the already-created
order/Razorpay-order pair is kept in client state (`pendingOrder`) so
clicking "Complete Payment" again reopens the *same* Razorpay order instead
of creating a duplicate — the DB order stays `"pending"` either way, which
is an expected, admin-visible state (no separate abandoned-order cleanup
exists, matching this project's v1 scope elsewhere). No webhook endpoint is
set up — the signature-verified client callback is Razorpay's own
documented minimum-viable integration; a webhook would additionally cover
"payment succeeded but the browser closed before the callback fired," noted
here as a real gap, not silently ignored.

**Shipping, coupons, and tax (`0013_shipping_coupons_tax.sql`).** Replaces
the old hardcoded `lib/shipping/rate-table.ts` and wires up the
`discount_amount` column that had existed since `0001` but was never set to
anything but `0`. `lib/services/shipping.ts#getShippingEstimate` now
matches the shipping address's state against admin-managed
`shipping_zones` (falling back to the zone marked `is_default`, and — if a
store has zero zones configured yet — to the *original* static-table
constants, so checkout never breaks on a fresh install). This is a real DB
read, unlike the old pure-constants version, which is why it moved behind
a Server Action (`estimateShippingAction`,
`app/(site)/checkout/actions.ts`) — a client component can no longer call
it directly. `createOrderAction` computes `discountAmount` (via
`validateCoupon`, re-validated from scratch server-side — never trusts the
client's earlier "Apply" preview) and `taxAmount` (`(subtotal -
discount) × rate_percent`, `0` whenever tax is inactive) itself, folds both
into `total`, and — only after the order row is actually created —
increments the coupon's `times_used` (`recordCouponUsage`). Free shipping
(`shipping_zones.free_shipping_threshold`) is evaluated against the raw
subtotal, not the post-discount amount, in both the live preview
(`checkout-content.tsx`) and the final order.

**A real client/server-boundary bug hit while building this**:
`INDIAN_STATES` used to live in `lib/services/shipping.ts` alongside
`getShippingEstimate`, and three client components
(`checkout-content.tsx`, `cart/shipping-estimator.tsx`,
`account/addresses-panel.tsx`) imported it from there. Once
`getShippingEstimate` started doing a real DB read through
`createAdminClient()` (`server-only`-guarded), importing *anything* from
that file — even an unrelated constant — pulled the whole server-only
dependency chain into the client bundle and failed the build outright
(`server-only` is deliberately not tree-shakeable around this; that's the
point of the guard). Fixed by giving `INDIAN_STATES` its own zero-dependency
leaf module, `lib/config/indian-states.ts`, which is what client components
now import; `lib/services/shipping.ts` only re-exports it for the
server-rendered admin pages that already imported it from that path. The
general rule this leaves behind: a constant that needs to be safely
client-importable can never share a file with server-only logic, even via
re-export from the tainted file itself — only a direct import from a clean
module avoids the taint.

## 17. Admin CMS

Fully isolated from the storefront via Next's **multiple-root-layouts**
route-group mechanism (`app/(site)/` and `app/admin/` are sibling route
groups, each with its own root `layout.tsx` — `(site)` has the original
`<html>/<body>`/`SiteHeader`/`SiteFooter`/`CartProvider`/`WishlistProvider`,
`admin` has none of that, its own minimal `<html>/<body>` + just an `Inter`
font load). This is why the entire pre-existing `app/` tree moved into
`app/(site)/` in this session — route groups don't appear in the URL, so
`/`, `/shop`, `/product/[slug]`, etc. are all byte-identical URLs to before;
only the on-disk file path changed. `components/admin/*` is never imported
from anywhere under `app/(site)/`, so it's structurally impossible for admin
code to end up in the storefront bundle (verified by grep, not just
assumption).

`app/admin/(protected)/layout.tsx` is a *second*, nested route group inside
`admin/` — everything in it calls `requireAdmin()` (§15); `admin/login/
page.tsx` sits outside that group specifically so the gate doesn't redirect
the login page to itself.

Routes: `/admin` (dashboard — order/revenue/product counts + recent orders,
a handful of parallel aggregate queries, `lib/repositories/admin/
dashboard.ts`), `/admin/products` (+ `new`/`[id]` — full CRUD, search,
Cloudinary multi-image upload/reorder/delete, soft-delete via `is_active`
only, never a hard delete since `order_items.product_id` can reference a
product — see below for the one deliberate, narrowly-scoped exception.
`product-images-manager.tsx`'s upload form reports its own `pending` state
up to `product-form.tsx` via an `onUploadingChange` callback, which
disables the main "Save Product" button (plus an inline "Image uploading —
please wait" note) for the duration — the images manager is a sibling
`<form>`, not nested (§17 note above about why), so without this the main
form had no way to know an upload was in flight. Every entity form in this
admin (`product-form.tsx`, `collection-form.tsx`, `banner-form.tsx`,
`shipping-zone-form.tsx`, `coupon-form.tsx`) fires a `sonner` success toast
and navigates back to that entity's **list** page on a successful save —
create and update alike — rather than the old create-only "redirect to the
new item's own edit page, do nothing on update" behavior),
`/admin/collections` (+ `new`/`[id]`, single-image variant of the
same pattern), `/admin/banners` (+ `new`/`[id]` — briefly grew a richer
"Content"/"Secondary Button & Offer Badge" CMS system (badge/headline
[required]/subheading/secondary CTA/offer badge) modeled on an external
reference the user shared, then was reverted after that same required
`headline` turned out to silently block saving a plain image banner (the
form always returned `"Headline is required."`, so **zero** banners had
ever actually made it into the table — confirmed by querying it directly
before this fix). The lesson: match a reference's structure, not its
required-field assumptions, without confirming they fit how *this* admin
is actually used. Current shape: a header card (title from
`desktop_image_alt`, a big switch-style `Active` toggle, a `Position`
number input) above the form, then `AdminCard`s for Link
(`primary_cta_text`/`primary_cta_href`, both optional — text defaults to
"Shop Now" if only a URL is set, see `dbBannerToBanner`), Desktop/Laptop
Image, and Mobile Image — nothing else is admin-settable per banner
anymore. `badge_text`/`headline`/`subheading`/`secondary_cta_*`/
`offer_badge_text` stay as unused, always-`null`/`""` columns (no
migration to drop them — cheap to leave, avoids a destructive schema
change) — `types/product.ts`'s `Banner` app type, `lib/mappers/banner.ts`,
and `lib/repositories/banners.ts`'s select list were all trimmed to match,
so nothing in the app actually reads them anymore either. Each image
section is `components/admin/banner-image-field.tsx`, used once per
breakpoint with entirely separate field names/state (a drag-and-drop
dropzone with a "paste a URL instead" toggle — pasted URLs are stored
as-is with a null `cloudinary_public_id`, so `deleteImage` is never called
on an asset this app doesn't own — alt text, crop-focus sliders, and a
live preview). A "Remove" checkbox on the mobile image reverts a banner to
laptop-image-only. Banners also get a genuine **hard delete**
(`deleteBannerForAdmin` + `deleteBannerAction`, with a `confirm()` guard in
the form) — unlike products/collections, nothing else references a banner
row, so the usual soft-delete-only convention doesn't apply here.

The list page also has `components/admin/banner-bulk-upload.tsx`: **two
independent** `<input type="file" multiple>` pickers — "Laptop Images" and
"Mobile Images" are never merged into one input — feeding
`bulkCreateBannersAction`, which pairs them by position (1st laptop with
1st mobile, 2nd with 2nd, ...) into one banner per laptop image; a laptop
image with no matching mobile one just falls back like normal, and any
extra mobile images past the laptop count are skipped and reported back
rather than silently dropped. Centered crop, no copy/link, on every
bulk-created banner — open any of them afterward to add a headline or
fine-tune the crop. For quickly seeding several carousel slides at once.
Adding more active banners (any sort order) is how the carousel gets more
slides either way — there's no separate "carousel" entity, the list of
active rows *is* the carousel. Every crop-preview frame
(`components/admin/banner-preview.tsx`'s `BannerPreviewFrame`) is sized via
`aspect-[]` classes from `lib/config/hero-dimensions.ts`, and the
recommended-upload-size copy shown next to each upload reads from the same
file — both are derived from the same reference-viewport numbers so they
can't silently disagree with each other the way they did in an earlier pass
(preview frame at one arbitrary ratio, copy suggesting a different one).

On the storefront, `hero-section.tsx` is text-free except for one small
bottom-right link — always rendered, unconditionally, reading
`banner.link` (`label` defaults to "Shop Now", `href` to `/shop`) — plus
the pagination dots. Each slide's image pair is also wrapped in its own
`<Link>` to that same href, so the *entire* visible photo is clickable,
not just the small text corner (a native `<a>` inside the horizontal
scroll-snap track already distinguishes a drag/swipe from a tap, so this
doesn't interfere with the swipeable carousel). Both breakpoint images
render for every slide simultaneously, toggling which one is visible via
`sm:hidden`/`hidden sm:block` rather than swapping `src` in JS — next/
image's lazy-loading (based on layout size) then never fetches the hidden
one, except on the first slide, which forces `priority` on both variants
since SSR can't know the visitor's breakpoint ahead of time), `/admin/inventory` (bulk
per-product stock table — thumbnail/name/category/inline-editable stock
quantity/computed `StockStatusBadge`, `StatCard` summary row, search + a
low-stock/out-of-stock filter select mirroring the Orders status filter;
per-row save via `useTransition`, not a page-wide form, matching
`product-images-manager.tsx`'s per-row save pattern; `stockQuantity`/
`lowStockThreshold` are also plain fields on the Product form's
"Organization" card for single-product convenience — both write to the same
`products` columns, §14), `/admin/orders` (+ `[id]` — list/detail/status
update, no customer-facing write path exists for these tables),
`/admin/customers` (read-only list + `[id]` detail page — full profile info,
saved addresses via `lib/repositories/addresses.ts#listAddressesForUser`
called with the **admin** client instead of the cookie-bound one it's
documented for, which works with no code changes since it just filters
`.eq("user_id", userId)` and RLS is bypassed rather than needing to match
`auth.uid()`; and every order via a new `listOrdersForCustomer`, each
linking to the existing `/admin/orders/[id]`), `/admin/shipping` (+
`new`/`[id]` — full CRUD + real delete over `shipping_zones`, following the
Collections template exactly, states picked via the same chip-`Checkbox
Group` pattern as `product-form.tsx`'s sizes/sleeves, §16), `/admin/
coupons` (+ `new`/`[id]` — same template, plus a read-only "Used N times"
count on the edit page since `times_used` is only ever changed by checkout
itself, §16), `/admin/settings`
(signed-in-admin info +
credential changes, a `SocialLinksForm` card — an editable list of
label/URL rows, add/remove client-side, one "Save" replaces the entire
`social_links` table via `lib/repositories/admin/social-links.ts`'s
`replaceSocialLinks`, mirroring `replaceProductRelations`'s delete-then-
reinsert convention since there's no per-row identity worth preserving for a
handful of footer links edited as one list, and now a `TaxSettingsForm`
card — rate/label/active toggle over the `tax_settings` singleton row, no
new nav entry the same way Social Links didn't get one, §16).

`/admin/collections` also carries two homepage-media cards above its
existing collections table — `CampaignBannerForm` (image + alt + link
label/href over the `homepage_campaign` singleton, §14) and
`GalleryImagesForm` (four independent per-tile upload forms, each its own
`useActionState` mirroring `product-images-manager.tsx`'s per-image save
pattern, over the four `homepage_gallery_images` rows). Placed here rather
than on a new route or under Settings by explicit request; neither card
touches the collections CRUD table/actions on the same page.

**Bulk product selection** (`components/admin/products-table.tsx`, a
Client Component the Server Component list page hands its already-fetched
rows to). A header checkbox (indeterminate when some-but-not-all rows are
picked, via a ref since that state has no HTML attribute) plus a per-row
checkbox drive a `Set<string>` of selected ids; a bulk-action bar appears
above the table once anything's selected (`Activate`/`Deactivate`/`Delete`/
`Clear`, `useTransition` + `router.refresh()` after each — this component
holds server-fetched data in local state, so a `revalidatePath` alone
doesn't repaint it). `Deactivate` is `bulkSetProductActive` (§14, a single
`update ... where id in (...)`, not N round trips) — no new risk, same
soft-delete the per-row button already did. `Delete` is the one place a
product row can be genuinely removed, and it exists specifically *because*
of the "never a hard delete" rule above, not despite it:
`bulkDeleteProductsAction` checks every selected id against real
`order_items` history (`getProductIdsWithOrders`) first — anything that's
ever been ordered is deactivated instead, and that's always reported back
by name in the confirmation toast, never silently substituted. Only
products with zero order history are actually deleted (row + cascaded
`product_images`/`product_sizes`/`product_sleeve_options`/
`product_collections` + their Cloudinary assets). Verified directly
against the database with a throwaway pair of products — one with a real
`order_items` row, one without — confirming the ordered one survives
(deactivated) and the unordered one is actually gone, cascade included.

Storefront consumers of the two new tables fall back to hardcoded defaults
when empty, so an unconfigured store never regresses: `hero-section.tsx`'s
`FALLBACK_BANNERS` (§8) and `site-footer.tsx`/`social-section.tsx` falling
back to `site.social` (`lib/config/site.ts`) when `getSocialLinks()` returns
zero rows. `site-footer.tsx`'s existing `SOCIAL_MONOGRAMS` label→icon
fallback map (lucide-react dropped brand glyphs, so labels render as a short
monogram) is untouched — any admin-added label not in that map just falls
through to its own first-letter fallback exactly as before.

See `Architecture Files/ADMIN_CMS_AUDIT.md` for a full Shopify-Admin feature
comparison and prioritized backlog of what's still missing (discounts, staff
permissions, order refunds, nav/menu editing, taxes/shipping zones, etc.).

No shadcn `table`/`textarea`/`checkbox` primitives existed in this project
(`components/ui/` — see §2) — admin list/detail pages use plain styled
`<table>`/`<textarea>`/native `<input type="checkbox">` rather than adding
new component surface for a section explicitly scoped as "practical,
usability over experimental visual design."

**One real bug hit and fixed here**: a product's edit form originally
rendered its own `<form>` wrapping `ProductImagesManager`, which *also*
renders a `<form>` (the image upload control) — nested `<form>` elements are
invalid HTML and the browser silently reparents them, breaking submission.
Fixed by moving the images manager to be a sibling of the main form, not a
child (`components/admin/product-form.tsx`).

## 18. Cloudinary image pipeline

Cloudinary stores/delivers all product and collection imagery; Supabase only
stores metadata (`cloudinary_public_id`, `image_url`, `width`, `height`) —
no image binaries ever touch Postgres.

`lib/cloudinary/admin.ts` (`server-only`) — `uploadImage(buffer, folder,
{publicId?})`/`deleteImage(publicId)`, lazily calls `cloudinary.config()` on
first use rather than at module load (needed so the standalone seed/migration
scripts, which load `.env.local` themselves after static imports resolve,
don't configure the SDK with empty credentials — see §9.12/§9.14). Admin
product-image uploads get a random Cloudinary-generated `public_id`; the seed
script passes an explicit deterministic one per gallery file so re-seeding
overwrites instead of duplicating.

**Delivery**: `next.config.ts` sets `images.loader: "custom"` pointing at
`lib/cloudinary/loader.ts`, which builds `f_auto,q_auto,dpr_auto,w_<width>`
Cloudinary transformation URLs directly from the width Next's `<Image>`
component requests — Cloudinary does all the actual resizing/format
conversion, Next only manages the `srcset`/lazy-loading/layout side. This
avoids stacking Next's own image-optimization proxy (`/_next/image?...`) on
top of Cloudinary's, which the backend brief explicitly warned against.
Confirmed in this session by inspecting rendered `<img>` `srcset` output
directly — URLs point straight at `res.cloudinary.com` with the expected
transformation string, never at `/_next/image`. `images.remotePatterns` is
still set (`res.cloudinary.com/<cloud_name>/**`) as defense-in-depth even
though the custom loader means Next never actually proxies these URLs itself.
Non-Cloudinary sources (the handful of homepage sections still using local
`/images/*.webp` paths directly, §8) pass through the loader unchanged.

## 19. Caching & revalidation

Classic Next model, not Cache Components (§9.11). `lib/services/products.ts`
wraps its two base fetchers (`listActiveProducts`→mapped, `listActiveCollections`
→mapped) in `unstable_cache` tagged `"products"`/`"collections"`,
`revalidate: 3600`; `lib/services/banners.ts`/`social-links.ts`/`homepage.ts`
follow the identical pattern, tagged `"banners"`/`"social-links"`/
`"homepage-campaign"`/`"homepage-gallery-images"` — every banner/social-link/
homepage-media admin mutation calls the matching `revalidateTag(tag, "max")`.
`getProductBySlug`/`getCollectionBySlug` additionally tag
their own entry (`product:<slug>`/`collection:<slug>`) via a wrapper created
per call (the key array stays static, the slug is passed as the cached
function's actual argument — `unstable_cache` hashes arguments into the cache
key automatically, so this differentiates entries correctly without needing
the tag array itself to vary safely). Every admin product/collection mutation
calls `revalidateTag("products"/"collections", "max")` — deliberately broad
(not narrowed to the one edited row in every case) since the catalog is small
enough that over-invalidating costs nothing, and it's simpler to reason
about than chasing which pages a given edit could affect (brief's own example
list — product page, shop page, collection page, homepage sections, related
products — is close to "everything" anyway).

`lib/repositories/products.ts`/`collections.ts` use `lib/supabase/anon.ts`
(no cookies) specifically so they're safe to call from inside
`unstable_cache` — a cookie-bound client would break the "no request-scoped
APIs inside a cached function" rule.

## 20. Environment variables, migrations & deployment

**Env vars** (`.env.example` is the committed template; `.env.local` — real
values, gitignored):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY     # anon-equivalent, safe client-side
SUPABASE_SECRET_KEY                      # service-role-equivalent, server-only
SUPABASE_JWT_SECRET                      # legacy, unused by the current key-based flow
SUPABASE_DB_URL                          # session-pooler URL, scripts only (§9.14) — never the direct db.<ref> host
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RAZORPAY_KEY_ID                          # server-only; also returned per-request to the client from the checkout
                                          # Server Actions (Razorpay's key_id isn't a secret and must reach
                                          # Checkout.js) — never given a NEXT_PUBLIC_ prefix, §16
RAZORPAY_KEY_SECRET                      # server-only, never leaves the server — signs/verifies payments
```

**Migrations** (`supabase/migrations/*.sql`, numbered, applied in order):
`npx tsx supabase/scripts/run-migrations.ts` — a direct-`pg` runner against
`SUPABASE_DB_URL` (not the Supabase CLI's `db push`, which needs an
interactive `supabase login`). Tracks what's applied in a `schema_migrations`
table, so re-running is a no-op for already-applied files — safe to run
after pulling new migrations.

**Seeding**: `npx tsx supabase/seed/seed.ts` — imports `lib/mock-data/`
directly (not a hand transcription) and uploads `public/images/`'s 6 photos
to Cloudinary, so the seeded catalog is pixel-for-pixel the same data the
mock array always had. Safe to re-run (upserts on slug, deletes+reinserts
child rows per product/collection).

**First admin account**: no public admin sign-up path exists (§15) by
design. Sign up normally via `/account`, confirm the email, then run
`npx tsx supabase/scripts/promote-admin.ts you@example.com` (service-role
client, bypasses the `profiles.role` change guard, §14) to flip that one
account to `role = "admin"`.

**Deployment checklist**: set all seven env vars above in the hosting
platform; run migrations + seed once against the target Supabase project;
promote at least one admin account; confirm Supabase Auth's redirect
URLs/allowed origins include the production domain; `npm run build` clean
(verified in this session, §12 step 14). No CI is configured (unchanged from
before the backend build, §3).

**Rotate the credentials that were pasted in plaintext into `prompt files/
backend.md`** (now gitignored, §4/§12 step 14, but was plaintext on disk and
in this conversation regardless) before relying on this project for anything
beyond development — this wasn't done as part of the backend build itself,
since rotating live keys is a decision for whoever owns the Supabase/
Cloudinary accounts, not something to do unprompted.

## 21. Explicitly out of scope

**Implemented in the backend build (§13–§20), no longer out of scope**:
Supabase/database, real auth (customer + admin), admin panel, real order
persistence.

**Still explicitly out of scope**, same as the original brief:

- **No payment gateway.** Orders are created with `payment_status: "pending"`
  always — nothing in this codebase ever marks an order paid. Checkout's
  "Payment integration coming soon" placeholder is unchanged. Integrating one
  is a change confined to `app/(site)/checkout/actions.ts#createOrderAction`
  (call the provider after order creation, update `payment_status` from its
  webhook/callback) — it doesn't need to touch the schema (`payment_status`
  already supports `paid`/`failed`/`refunded`, §14) or the checkout UI beyond
  that.
- **No real shipping-provider API.** `lib/services/shipping.ts` still returns
  mock rates from `lib/shipping/rate-table.ts` — real integration replaces
  that module's contents, not its call sites (checkout and the account
  address flow).
- **Minor**: a handful of homepage sections (hero, social grid) reference
  `public/images/*.webp` directly rather than through the Supabase-backed
  catalog, since they were never part of product/collection data — this
  produces a harmless "loader missing width" dev-console warning under the
  global custom Cloudinary loader (§18); confirmed non-functional via direct
  testing, not yet silenced.
- **No cross-tab/cross-device realtime sync** for cart/wishlist — an
  authenticated user's cart updates via Server Action + reconciliation
  (§16), not a live subscription; a second open tab won't see a change made
  in the first until it refetches.

The repository/mapper/service layering (§13) exists specifically so any of
these can be added later without UI rewrites — that work replaces the bodies
of `lib/services/*.ts` functions (or adds new repository/mapper files), not
their call sites.
