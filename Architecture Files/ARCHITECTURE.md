# JUNEFOURTEEN — Project Architecture

**Read this file first.** It is written to be the single document a new chat
session (with zero prior context) needs to become productive on this project
immediately — what it is, how it's built, where things live, why key decisions
were made, and what's outstanding. When you make a significant architectural
change, update this file in the same session.

---

## 1. What this is

A **frontend-only prototype** for JUNEFOURTEEN, a premium women's
ethnic-contemporary fashion e-commerce brand. Black/white/warm-canvas editorial
design system, full shopping flow (browse → filter → product detail → custom
sizing → cart → checkout shell), no backend. Built end-to-end by Claude across
several sessions in this repo, from an empty directory.

- **Brand name**: `JUNEFOURTEEN` (was briefly "ANTARA" during early development —
  fully renamed, see §9). Single source of truth: `lib/config/site.ts`. Never
  hardcode the brand name as a literal string anywhere — always
  `site.name`/`site.description`/etc.
- **Tagline**: "Quietly Bold"
- **Repo**: https://github.com/AllgoZ/Junefourteen.git, branch `main`. Only
  commit/push when the user explicitly asks — it hasn't been treated as
  auto-commit-on-change.

## 2. Tech stack (exact versions, check `package.json` if this drifts)

- Next.js **16.3.0**, App Router, Turbopack
- React **19.2.8**
- TypeScript **5**
- Tailwind CSS **4** (CSS-first config via `@theme` in `app/globals.css`, no
  `tailwind.config.js`)
- shadcn/ui — Radix base (`-b radix`), "Nova" preset. `components.json` at repo
  root. Primitives live in `components/ui/`.
- lucide-react **1.31.0** — **v1 dropped all brand/logo icons** (Instagram,
  Facebook, etc. don't exist as imports anymore; social links in the footer use
  short text monograms "IG"/"FB" instead).
- No state library (no Redux/Zustand/Jotai) — plain React Context +
  `useSyncExternalStore` over a tiny custom store, see §6. Deliberately kept
  during the `redesignv2.md` pass (§12 step 6) even though that brief asked
  for Zustand — the existing pattern already gives persistence, SSR-safety,
  and passes the React Compiler lint rules, so swapping it in would have been
  churn with no functional gain.
- **`motion` (Framer Motion's successor package, imported from `motion/react`)**
  — added in the `redesignv2.md` pass, used narrowly for the handful of
  places CSS transitions genuinely can't do cleanly: the PDP mobile sticky
  purchase bar's enter/exit (`add-to-bag-panel.tsx`), the PDP gallery's
  active-image crossfade (`product-gallery.tsx`), cart line-item add/remove
  (`cart-line-item.tsx`), and the wishlist-heart tap pulse
  (`wishlist-button.tsx`). Not used for the product-card hover crossfade
  (still plain CSS `group-hover:opacity` — cheap at grid scale).
  Extended in the `rawprompt.md` pass (§12 step 9) for two more scoped uses:
  the hero's banner crossfade/autoplay (`hero-section.tsx`, plain
  `AnimatePresence` opacity crossfade + one `setInterval`), and the
  scroll-driven "showcase" chapter (`scroll-showcase-section.tsx`) — a
  `useScroll`/`useTransform` scroll-linked `backgroundColor` morph, plus
  `whileInView`/`onViewportEnter` to drive the desktop sticky image panel's
  crossfade as product rows scroll past. Still not used for generic
  section-level scroll-reveal beyond that one component.
- No form library — plain controlled inputs + hand-written validation
  (`lib/validation.ts`).

**This is intentionally a light dependency footprint.** If you're about to
`npm install` something, check whether the existing patterns already cover it
first (this codebase has repeatedly favored native browser APIs + a small
custom utility over pulling in a library) — `motion` above is the one
deliberate exception, added for a specific, narrow set of enter/exit
animations, not swapped in wholesale.

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
the dev server headlessly to screenshot pages and click through flows across
viewports (390/430/768/1024/1280/1440/1920px). No CI is configured.

## 4. Repository structure

```
app/                        Next.js App Router routes (see §5 for the full route table)
components/
  account/                  Wishlist summary widget used inside /account
  cart/                     Cart drawer, line item, shipping estimator
  checkout/                 Checkout form + order summary
  home/                     Homepage sections (hero carousel, collections, scroll showcase, ...)
  layout/                   Container, SiteHeader, SiteFooter, MobileNav, NewsletterForm
  marketing/                StaticPage wrapper + ContactForm (used by about/contact/legal pages)
  product/                  Product card/grid/gallery/image, size & custom-size flow, add-to-bag panel
  providers/                CartProvider, WishlistProvider (see §6)
  search/                   SearchOverlay
  shop/                     Breadcrumb, FilterSheet/SortSheet (mobile), FilterBarDesktop (desktop)
  ui/                       shadcn primitives + shared atoms (EmptyState, TonalPlaceholder, EditorialImage, ...)
  wishlist/                 WishlistGrid
hooks/                      use-recent-searches.ts
lib/
  config/site.ts            Brand config — THE place to change brand name/nav/footer links/social
  mock-data/                Product catalog, collections, size chart, gallery image list, care-preset text, popular searches
  services/                 Async data-access functions — see §7, the Supabase-swap seam
  format.ts, validation.ts, storage.ts, local-store.ts, shop-filters.ts, utils.ts (cn helper)
types/                      product.ts, cart.ts, shipping.ts — shared TS types
public/images/              Real dummy product photography (6 files, see §8)
Architecture Files/         This file.
prompt files/                Original + follow-up design briefs given by the user (see §11 — these are
                             historical/reference inputs, not live specs to re-apply)
dummy images/                Original, uncropped source photos before they were copied into public/images/
```

## 5. Routes

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, featured collections, new arrivals rail, editorial splits, best sellers, social grid, newsletter |
| `/shop` | Full catalog with filters/sort (URL-search-param driven) |
| `/collections/[slug]` | Same shop UI pinned to one collection (`generateStaticParams` over the 4 collections) |
| `/product/[slug]` | Product detail page (`generateStaticParams` over all 14 products) |
| `/search` | Full search results page (also reachable via the header search overlay) |
| `/wishlist` | Wishlist grid + move-to-bag |
| `/cart` | Full-page cart (same `CartContent` component the drawer uses, `variant="page"`) |
| `/checkout` | Checkout shell — contact/address/delivery/payment-placeholder/order summary, no real payment |
| `/account` | Accordion-styled list rows: Orders/Wishlist/Addresses/Profile, all "coming soon" except Wishlist |
| `/size-guide` | Standalone size chart page (same content as the in-PDP size guide modal) |
| `/about`, `/contact`, `/shipping`, `/returns`, `/faq`, `/privacy`, `/terms` | Static/marketing pages via `components/marketing/static-page.tsx` |

`/shop`, `/collections/[slug]`, and `/search` are server-rendered on demand
(`ƒ` in the build output) because they read `searchParams`. Everything else is
statically prerendered.

## 6. State management

**Cart, Wishlist, and Recent Searches are all backed by `localStorage`** via one
shared pattern in `lib/local-store.ts`:

```ts
createLocalStore<T>(key, fallback) → { getSnapshot, getServerSnapshot, subscribe, set }
```

Consumed through React's `useSyncExternalStore` in `components/providers/
cart-provider.tsx` and `wishlist-provider.tsx` (both mounted once in
`app/layout.tsx`, wrapping the whole tree) and in `hooks/use-recent-searches.ts`.

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

## 7. Data architecture (the future-Supabase seam)

Nothing hits a database. `lib/mock-data/` holds static arrays; `lib/services/`
wraps them in **async functions** — deliberately async even though nothing
awaits anything today, so swapping mock data for real Supabase calls later is a
change confined to `lib/services/*.ts` with no UI rewrites:

- `lib/services/products.ts` — `getProducts(filters?)`, `getProductBySlug()`,
  `getRelatedProducts()`, `getCollections()`, `getCollectionBySlug()`,
  `getNewArrivals()`, `getBestSellers()`, `getAllCategories()`,
  `getAllSleeveOptions()`, `searchProducts()`
- `lib/services/shipping.ts` — `getShippingEstimate({country, state, pin})`,
  mock rate table (Tamil Nadu ₹100 / rest of India ₹120 / remote ₹150),
  `INDIAN_STATES` list
- `lib/services/search.ts` — combined product + collection search

**Mock catalog**: 18 products (`lib/mock-data/products.ts`) across 5 collections
— Everyday Edit, Handloom Stories, Festive Edit, Contemporary Classics, Black
Edit (`lib/mock-data/collections.ts`). Products mix new/best-seller/sold-out/
on-sale/custom-size-enabled/sleeve-option states so every UI state has a real
example to hit (e.g. `/product/rani-weave-kurta-set` is sold out,
`/product/handloom-kurta-set` supports custom sizing + sleeve options). 4
in-stock products are tagged into `black-edit` for the homepage's dedicated
Black Edit chapter (§10) — see the note there on why they aren't literally
black garments.

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
repo root. Two components implement the same "real photo if present, else
placeholder" fallback **independently** (not sharing code — a known small
duplication, fine to leave as-is unless you're touching both):

- `components/product/product-image.tsx` — for `ProductImage` objects
  (`image?.src` → `next/image`, else `TonalPlaceholder` seeded by `image.tone`)
- `components/ui/editorial-image.tsx` — same pattern for non-product imagery
  (hero, `EditorialSplit`, `FeaturedCollections` tiles, social grid), plus an
  `objectPosition` prop (used on the hero/About banner to bias the crop toward
  faces — default center-crop was cutting heads off on the very wide/short hero
  aspect ratio)
- `components/ui/tonal-placeholder.tsx` — the actual placeholder: a
  deterministic grayscale gradient (seeded by a 0–1 `tone` value so the same
  product always renders the same placeholder) with a centered Lucide `Shirt`
  icon. `ASPECT_CLASSES.portrait` is `aspect-[4/5]` (the fashion-photography
  ratio) — this one constant drives product cards, gallery, cart/wishlist
  thumbnails, everywhere.

`lib/mock-data/gallery-images.ts` exports the 6 image paths.
`lib/mock-data/products.ts`'s `images()` helper assigns real `src` to every
product image via a **deterministic slug-hash rotation** through those 6 photos
— no per-product manual wiring needed; adding a product automatically gets a
consistent, repeatable set of real images. To add more real photography: drop
files in `public/images/` and extend `GALLERY_IMAGES` — everything downstream
(products, collections, hero, editorial sections) keeps working unchanged.

## 9. Framework/tooling gotchas hit while building this (don't re-discover these)

### 9.1 Next.js 16 / React 19
- `params` and `searchParams` are **Promises** in `page.tsx`/`layout.tsx`/
  `generateMetadata` — must `await` them. Type with the generated helpers
  `PageProps<'/route'>` / `LayoutProps<'/route'>`, not hand-rolled prop types.

### 9.2 `eslint-config-next`'s `core-web-vitals` enforces React Compiler rules as errors
- `react-hooks/purity`: don't call `Date.now()`/`Math.random()` during render
  (e.g. inline in a JSX prop). Compute it inside the event handler instead.
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
Hit this building `components/home/featured-collections.tsx`'s asymmetric
"1 large + 3 stacked" layout: a grid item with an `aspect-ratio` (via
`TonalPlaceholder`) grew past the container's `h-[760px]` and overlapped the
section below, because with no explicit row template the implicit row sizes to
`auto` (content-based). **Fix**: give the grid explicit row sizing —
Tailwind's `grid-rows-{n}` utilities emit `repeat(n, minmax(0, 1fr))`, and the
`minmax(0, ...)` is what breaks the content-based growth — plus `min-h-0` on the
grid-item children as a second line of defense. Don't assume a height on a grid
container alone constrains children that have their own aspect-ratio.

### 9.6 Hydration mismatch from browser extensions (e.g. Grammarly)
`data-new-gr-c-s-check-loaded` / `data-gr-ext-installed` appearing on `<body>`
in a hydration-mismatch warning is the Grammarly extension injecting attributes
before React hydrates — not a real bug. Fixed with `suppressHydrationWarning`
on the `<body>` tag in `app/layout.tsx` (shallow — only suppresses mismatches on
that specific element, not the whole tree).

### 9.7 CSS `aspect-ratio` + a definite height computes width from the ratio, not the parent
Hit this in `FeaturedCollections`' secondary column during the `redesignv2.md`
pass: `EditorialImage`/`TonalPlaceholder`/`ProductImage`'s shared wrapper div
had `aspect-[4/5]` but no explicit `w-full`. As long as callers only gave it
an aspect ratio (auto width *and* auto height), the block-level default of
"fill parent width" won and `aspect-ratio` only ever constrained height —
fine, until a caller (`CollectionTile`, via `className="h-full"`) also
supplied a *definite height*. Per the CSS sizing spec, once height is
definite and width is auto, `aspect-ratio` derives width from height × ratio
instead of the normal block "fill parent" behavior — so the box shrank to
~30% of its column width, well short of visibly breaking full-bleed images
across the row of secondary collection tiles. `EditorialSplit` had already
independently hit and worked around this locally (`lg:aspect-auto` cancels
the ratio when it also sets `lg:h-full`), but the underlying wrapper was
never fixed at the source. **Fix**: added `w-full` to the base classes in
all three wrappers (`components/ui/editorial-image.tsx`,
`components/ui/tonal-placeholder.tsx`, `components/product/product-image.tsx`)
so a definite width always wins regardless of what height a caller supplies.
If you pass `h-full` to any of these three components, this is why it was
safe to do so afterward — it wasn't, before.

## 10. Design system (current baseline — see §12 for how it got here)

- **Colors** (`app/globals.css`, plain hex not oklch): `#0A0A0A` primary black,
  `#171717` secondary black (hover/emphasis), `#FFFFFF` white, `#FAF9F6` warm
  canvas (`bg-offwhite`), `#F5F5F3` soft surface (`bg-muted`), `#E7E5E2` border,
  `#6B6B6B` muted text, `#8A8A8A` subtle text. `#FFAB00` amber
  (`--color-amber`) still exists as a token but is **unused** — it was added
  in the `redesignv2.md` pass for a small "New"-badge dot, then explicitly
  de-emphasized in `redesignv3.md` ("should not become a visible brand
  color") and the dot was removed. Leave the token defined but don't reach
  for it without a real reason. Two more tokens exist for exactly one purpose
  each: `--color-near-black` (`#050505`) and `--color-warm-white` (`#F5F2EE`)
  back the Black Edit section only (below) — don't reuse them elsewhere; they
  aren't part of the general palette.
- **"Black Edit" is now a chapter inside `components/home/scroll-showcase-section.tsx`**,
  not its own always-near-black section — superseded the old standalone
  `black-edit-section.tsx` (deleted) in the `rawprompt.md` pass (§12 step 9).
  The homepage's "Best Sellers" content (previously its own `HomeSection`)
  was folded in as the first ("color") chapter so it isn't shown twice; Black
  Edit is the second ("black") chapter. One outer `motion.div` scroll-links
  its `backgroundColor` (via `useScroll`/`useTransform` on a `[0, 0.22, 0.3,
  0.7, 0.78, 1]` progress → offwhite/near-black/offwhite stop set) across
  both chapters, so the page morphs white → near-black → white as you scroll
  through, instead of a hard section-boundary cut. Both chapters still reuse
  the `dark?: boolean` prop pattern on `HomeSection`/`ProductGrid` →
  `ProductCard` → `Price` from the original Black Edit implementation — that
  part wasn't changed, just relocated. `lg:` and up, each chapter also adds a
  **sticky follow-along gallery**: a `sticky top-24` product image pinned in
  a left column while a plain list of name+price rows scrolls in the right
  column; each row is a `motion.div` with `viewport={{ margin: "-45% 0px
  -45% 0px" }}` + `onViewportEnter` (an event callback, not a `useEffect`,
  so it doesn't touch the compiler's `set-state-in-effect` rule) that sets
  which row is "active," and the pinned image `AnimatePresence`-crossfades to
  match. Below `lg:`, no pinning — just the existing `<ProductGrid dark
  .../>`, same mobile-simpler-than-desktop pattern used elsewhere on the
  site. **Known content gap** (unchanged from before): none of the 6 real
  dummy photos (§8) are black garments; the 4 `black-edit`-tagged products
  are real in-stock, deep-toned pieces, not actually black — the section's
  *environment* and scroll mechanics are genuinely implemented, the
  photography inside is still a placeholder for real Black Edit photography.
- **Product grid: 2 columns at every breakpoint** (`components/product/
  product-grid.tsx`, mirrored in `product-grid-skeleton.tsx` and
  `wishlist-grid.tsx`) — mobile/tablet/desktop all render `grid-cols-2`,
  never 3 or 4, per the `redesignv2.md` "large product images, not a
  supermarket catalog" brief, reinforced again by the `rawprompt.md` pass.
  Card badges ("New"/"Sale"/"Sold Out") are quiet uppercase text over a thin
  gradient scrim, not filled chips. **Sold Out** moved from a filled
  bottom-left pill to the same top-left badge slot as New/Sale, in small red
  (`text-destructive`) text (`rawprompt.md` pass) — it now takes priority
  over New/Sale in that slot rather than living in its own bottom-left spot.
  Sale/discount pricing itself is still plain `text-foreground`, never red.
  Grid cards (`ProductCard`) no longer show the strike-through
  `compareAtPrice` (`Price`'s new `showCompareAtPrice` prop, default `true`,
  set `false` only from `ProductCard`) and render the name in a smaller,
  quieter `text-xs text-muted-foreground` rather than `text-sm
  text-foreground` — PDP (`add-to-bag-panel.tsx`) and cart line items are
  unaffected, they still show the strike-through. The overlay wishlist heart
  (`WishlistButton`'s `overlay` variant, used only from `ProductCard`) lost
  its `bg-background/70` circle — it's a bare heart icon now, kept legible
  over any photo with a small drop-shadow instead of a background chip; the
  PDP's `detail` variant (bordered square) is untouched.
- **Typography**: Inter (`next/font/google`, self-hosted) is the UI sans, stacked
  behind `-apple-system, BlinkMacSystemFont` so real Mac/iOS users get actual SF
  Pro. Fraunces (serif) is reserved for **genuine editorial moments only**:
  `EditorialSplit` big titles, footer brand statement, nav wordmark, About
  page. Every other heading (page H1s, section H2s, **product name on the
  PDP**) is sans with `font-medium tracking-tight`. Applying serif to every
  heading was an earlier mistake fixed in the v2 redesign (§12) — don't
  reintroduce it.
  **Exception since the `rawprompt.md` / Versace-leaning pass (§12 step 9):**
  the hero headline (`site.tagline`, overlaid on the banner carousel) moved
  *off* the serif list — it's now one huge bold **sans** headline
  (`text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight`), matching
  that pass's "bold geometric sans, not a delicate serif" direction. It's
  still the one deliberately loud typographic moment on the page — the
  "few-large-moments" budget is spent there, not by reintroducing serif or
  large text elsewhere.
- **Layout grid**: `components/layout/container.tsx` is the single source of
  horizontal boundaries — `max-w-[1440px]` default, `size="form"` (5xl,
  checkout), `size="medium"` (3xl), `size="narrow"` (2xl, cart/account/static
  pages), all sharing the same `px-4 sm:px-8 lg:px-12` gutter scale. Use this
  instead of hand-rolling `mx-auto max-w-[...] px-...` — that scattered pattern
  was the state before the v2 redesign and caused real misalignment.
- **Radius**: base `--radius: 0.75rem` (12px) driving `--radius-sm/md/lg/xl/2xl`.
  Bottom sheets (`FilterSheet`, `SortSheet`) use a larger `rounded-t-[1.75rem]`
  top radius + a `SheetDragHandle` component for the iOS feel.
- **Elevated CTAs**: `components/product/add-to-bag-panel.tsx` defines
  `PRIMARY_CTA`/`SECONDARY_CTA`/`STICKY_CTA` Tailwind class constants — taller
  (`h-14`/`h-12`), `rounded-2xl`, layered box-shadow (inset top highlight + soft
  drop shadow) for a physical "raised button" feel, `active:scale-[0.97]` press
  feedback. Scoped deliberately to just Add to Bag / Buy Now (inline + mobile
  sticky bar), not a global `Button` variant — the user asked for these two
  buttons specifically.
- **Empty states**: `components/ui/empty-state.tsx` is typography-first — no
  icon-in-a-circle (that was removed in the v2 redesign per explicit brief
  wording). Just a headline + one line + CTA.
- **Shop filters split by breakpoint**: `components/shop/filter-bar-desktop.tsx`
  (Popover-per-facet horizontal bar, immediate-apply) for `lg:` and up;
  `FilterSheet`/`SortSheet` (staged draft + Apply, bottom sheet) for mobile. Both
  write the same URL params.
- **Shipping estimator**: collapsed-by-default disclosure row inside the cart
  (`components/cart/shipping-estimator.tsx`), not a permanently-expanded form —
  progressive disclosure per the v2 brief.
- **No horizontal scroll-snap product rails anywhere, homepage or PDP.**
  `components/product/product-rail.tsx` (the old horizontal scroll-snap
  rail) was deleted in the `redesignv3.md` pass — New Arrivals (homepage) and
  "You May Also Like" (PDP) both render a plain, capped `<ProductGrid>`
  instead. Featured Collections went the same way — `grid-cols-2` at every
  breakpoint, no asymmetric-panel-plus-mobile-scroll layout. If you're
  tempted to add a horizontal *product* rail back, don't — it was a hard,
  repeatedly-stated requirement to remove them.
  **One narrow, deliberate exception added in the `rawprompt.md` pass**: the
  hero (below) auto-advances through banner images via an opacity crossfade
  (`AnimatePresence`, no horizontal drag/scroll-snap, no visible "rail") —
  different mechanism, hero-only, not a reopening of the product-rail rule.
- **Hero is now a 3/4-viewport (`h-[75dvh]`) banner carousel with one bold
  overlaid headline** (`components/home/hero-section.tsx`) — this
  *supersedes* the earlier redesign-v3 "hero has zero text" rule, on purpose,
  from the `rawprompt.md` / Versace-leaning pass (§12 step 9). It cycles
  through 4 banner images every ~5s (crossfade, see above), with a permanent
  bottom gradient scrim for legibility and `site.tagline` ("Quietly Bold") as
  one huge bold sans headline + one small "Shop New Arrivals" link — still
  the *only* text on the hero, not a return to paragraph copy or multiple
  CTAs. `components/home/campaign-image.tsx` is unchanged — the reusable
  "full-bleed photo as a visual beat between grid sections" component, at
  most one small corner label + arrow, never a heading or paragraph; it's
  still used once, as the closing section before `SocialSection`.
- **Site nav is transparent-over-hero on the homepage only**
  (`components/layout/site-header.tsx`, `rawprompt.md` pass) — white
  text/icons, no background/blur, while `pathname === "/"` and the page
  hasn't scrolled past the hero; solidifies to the existing
  `bg-background/90 backdrop-blur-md` treatment on scroll, exactly like
  every other route always has. Every non-home route's header is unchanged.
- **Homepage section rhythm is more generous**: `HomeSection`'s default
  padding moved from `py-14 sm:py-20` to `py-20 sm:py-28 lg:py-32`
  (`rawprompt.md` pass) — "few but very large visual moments" over a denser
  stack of sections. `HomeSection` also gained `compact?: boolean` (quiet
  uppercase label heading, used by every homepage section except the hero)
  and `dark?: boolean` (warm-white heading/View-All, reused by the scroll
  showcase's Black Edit chapter) — see above.
- **"Featured Collections" is now just "Collections," and the tiles carry no
  text at all** (`components/home/featured-collections.tsx`, `rawprompt.md`
  pass) — no name/arrow overlay on the photos (accessible name moved to
  `aria-label` on the `Link`), larger gap between tiles so each reads as one
  large photograph. The section's "View All" moved out of the shared
  `HomeSection` top-right slot into a small centered link *below* the grid
  instead — `HomeSection` isn't passed a `viewAllHref` here.
- **Homepage no longer explains the brand.** The "Our Philosophy"/"Our Story"
  sections were removed from `app/page.tsx` — that content already lives on
  `/about` (`#philosophy`/`#story` anchors) and wasn't duplicated, just
  relocated. Don't add brand-storytelling copy back to the homepage; link to
  `/about` instead.

## 11. Source documents in `prompt files/` — what each one is

These are the user's original design briefs, kept for reference/history. **They
are not live specs to keep re-applying** — treat them as inputs that already
shaped the current code (§12), except where noted as pending.

- `initialize.md` — the original from-scratch build brief (v1). Fully
  implemented — this is the prototype described in §12 phase 1.
- `v2.md` — "looks like a generic AI-generated template" redesign brief (46
  sections: tokens, container/grid, header/hero/collections/product-card
  rework, desktop-vs-mobile filter split, progressive disclosure, etc.). Fully
  implemented — this is most of what §10 describes.
- `redesignv2.md` — **Implemented, see §12 step 7.** A "photography-first"
  redesign brief (67 sections): always-2-column product grid, much less
  on-page text, minimal/near-textless hero and banners, an amber accent color
  (`#FFAB00`, used sparingly), quieter product cards, and asked to introduce
  Zustand for cart/wishlist state and Framer Motion for animation. Zustand was
  deliberately **not** added (the existing `useSyncExternalStore` pattern
  already satisfied the brief's functional intent with no call-site changes);
  Framer Motion **was** added (as the `motion` package) but scoped to four
  specific enter/exit animations rather than applied broadly.
- `redesignv3.md` — **Implemented, see §12 step 8.** A 97-section "master"
  redesign spec that explicitly overrides `redesignv2.md`'s *homepage
  direction specifically* (its own §04) while reusing everything else
  (architecture, PDP, cart, filters, state). The parts that actually changed
  vs. what v2 had already done: killed every remaining horizontal carousel
  (Featured Collections, New Arrivals, PDP related-products), stripped the
  hero to zero text, removed Philosophy/Story from the homepage (moved to
  `/about`, already there), added the "Black Edit" section, further
  de-emphasized amber (removed the one remaining visible usage), and
  restructured the mobile nav into grouped sections. Two things it explicitly
  allowed but weren't done: per-product "adaptive background matched to
  garment color" (§27–28 of that doc) and a second category-nav-bar on
  `/shop` — both called out as deliberately descoped in §12 step 8, not
  silently dropped.
- `rawprompt.md` — **Implemented, see §12 step 9.** A short, informally-worded
  homepage brief: shrink the hero to 3/4-screen with a banner carousel; drop
  "Featured" from Collections and strip all text off the collection tiles;
  quiet the New Arrivals grid (6 products, smaller/muted metadata, no
  strike-through, no wishlist-heart circle, red small "Sold Out" text); and a
  scroll-driven chapter that morphs the page white → black as you scroll from
  "premium color dresses" into Black Edit, with a "follow along" feel and
  product images that change as you scroll. The user then asked to style the
  homepage against `versace.com`/`thecollective.in`/`darveys.com` as
  references; live-fetching those sites for visual detail failed (Versace
  403'd automated fetches, the other two are JS apps that only exposed page
  titles), so direction was resolved by asking the user directly — they chose
  **Versace-leaning minimal luxury** (huge bold overlaid hero typography,
  transparent-over-hero nav, dramatic whitespace, few-but-large moments) over
  the denser Darveys/The Collective marketplace direction (promo banners,
  badges, brand strips, tight grids). That choice is why the hero gained bold
  text and the nav gained transparent-over-hero behavior — both explicit,
  deliberate overrides of rules from `redesignv3.md`, not accidental
  regressions; see §10 for exactly what changed.

## 12. Project history (chronological — why things are the way they are)

1. **Initial build** (`initialize.md`) — scaffolded Next.js from an empty repo,
   built the full v1 prototype under the brand name "ANTARA": design system,
   every route in §5, cart/wishlist/search via localStorage, custom-size
   measurement flow, mock shipping estimator, 14-product catalog. Verified with
   Playwright across desktop/mobile.
2. **v2 visual redesign** (`v2.md`) — user feedback: "looks like a generic
   AI-generated e-commerce template." Presentation-only overhaul, no functional
   regressions: new hex color tokens, typography discipline (serif pulled back
   to editorial moments only — the single highest-impact fix), the `Container`
   component, asymmetric hero/featured-collections compositions, desktop
   popover filter bar vs. mobile sheets, collapsed shipping estimator,
   typography-first empty states, list-row account page. Hit and fixed the CSS
   Grid row-sizing bug (§9.5) along the way.
3. **Rebrand + real imagery** — brand renamed ANTARA → JUNEFOURTEEN
   (`lib/config/site.ts` + every hardcoded page-metadata string that hadn't
   been using `site.name`). Wired in 6 real dummy product photos (§8),
   replacing tonal-gradient placeholders site-wide. Restyled Add to Bag / Buy
   Now with the "iOS elevated" treatment (§10).
4. **Git init + push** — repo initialized and pushed to
   https://github.com/AllgoZ/Junefourteen.git (`main`), two commits: initial
   commit, then a README brand-name fix.
5. **Hydration warning fix** — `suppressHydrationWarning` added to `<body>` in
   `app/layout.tsx` to silence a Grammarly-extension false positive (§9.6).
6. **This file created** — `redesignv2.md` had just been added to
   `prompt files/` (not yet implemented, see §11) when this architecture
   document was written, so it's captured here as outstanding work rather than
   assumed-done.
7. **`redesignv2.md` photography-first redesign implemented** — full pass
   across the whole site: 14→18-product catalog; product grid/wishlist grid
   collapsed to 2 columns at every breakpoint (was 2/3/4 by breakpoint);
   product-card badges rebuilt as quiet text over a gradient scrim (amber dot
   for "New"), sale price color fixed off red; homepage hero/editorial-split/
   footer copy trimmed hard (near-textless hero, one-sentence editorial
   bodies, footer collapsed from 4 link columns to 2 + a small legal row);
   added the `motion` package for four scoped animations (PDP sticky-bar
   enter/exit, PDP gallery crossfade, cart line-item add/remove, wishlist-tap
   pulse) — kept the existing `useSyncExternalStore` state pattern rather
   than adding Zustand, since it already met the brief's functional intent.
   Along the way, found and fixed a real, pre-existing CSS bug (§9.7) where
   `aspect-ratio` + a definite height silently starved images of width —
   surfaced by this redesign's `h-full` collection-tile layout, but present
   in the shared image wrapper since before this pass. Verified with
   `tsc --noEmit` + `npm run lint` + `npm run build` clean, plus an ad-hoc
   Playwright pass across 390/768/1024/1440/1920px on home/shop/PDP/cart/
   wishlist/search.
8. **`redesignv3.md` "photography-first" redesign implemented** — the delta
   on top of step 7, not a re-do: deleted `product-rail.tsx` and its two call
   sites (New Arrivals, PDP related-products), both now a capped
   `<ProductGrid>`; rebuilt `FeaturedCollections` as one plain `grid-cols-2`
   grid (was an asymmetric panel + mobile scroll carousel); stripped
   `HeroSection` to a bare full-bleed photo (removed the "Quietly Bold"
   headline and "Shop Collection" link); removed the "Our Philosophy"/"Our
   Story" `EditorialSplit` sections from `app/page.tsx` (unchanged on
   `/about`, added a matching `#philosophy` anchor there to pair with the
   existing `#story` one); added a 5th collection (`black-edit`) and tagged 4
   in-stock products into it; built `BlackEditSection` + a `dark` prop
   threaded `ProductGrid` → `ProductCard` → `Price`; added `CampaignImage`
   (reusable full-bleed, ~zero-text section) used twice on the homepage;
   removed the amber dot from the "New" badge; restructured
   `MobileNav` around three `Accordion` groups (Shop/About/Help) instead of a
   flat link list — and discovered/fixed a real shadcn default along the way:
   `AccordionContent`'s built-in `[&_a]:underline` (meant for prose-with-
   inline-links, e.g. FAQ answers) was underlining the plain nav links inside
   it; overridden per-usage with `[&_a]:no-underline` in `mobile-nav.tsx`
   rather than changed on the shared component, since other Accordion usages
   (FAQ, product info) want that prose behavior. Verified with `tsc`/`lint`/
   `build` clean and a Playwright pass across desktop/mobile confirming: zero
   hero text, both grids are true 2-columns at every breakpoint tested, the
   Black Edit heading computes to the intended warm-white color against the
   near-black background, no leftover horizontal-scroll rail on the PDP, and
   full add-to-bag/wishlist/collection-filter functional regression checks
   still pass. (Two apparent "blank section" bugs during that pass turned out
   to be `next/image` lazy-loading not finishing before Playwright's
   full-page screenshot stitched — confirmed fine with real scroll timing,
   not a code fix.)
9. **`rawprompt.md` homepage pass, styled Versace-leaning per user's chosen
   reference direction (§11)** — hero rebuilt as a `h-[75dvh]` 4-image banner
   carousel (`AnimatePresence` crossfade, ~5s autoplay, thin pagination bars)
   with one bold overlaid `site.tagline` headline + a small CTA link — a
   partial full-circle back to the pre-`redesignv3.md` hero (which also had a
   "Quietly Bold" headline, step 8), but now with a carousel and Versace-scale
   typography rather than the original's smaller single-image treatment.
   `SiteHeader` gained transparent-over-hero behavior on `/` only. Collections
   tiles lost all overlay text (accessible name moved to `aria-label`); its
   "View All" moved below the grid, centered and small. `HomeSection` gained
   `compact`/`dark` props and more generous default padding, applied to
   Collections and New Arrivals. New Arrivals bumped 4→6 products (2 more
   products tagged `isNew`) with a larger inter-card gap. `ProductCard`
   reworked: no strike-through on grid cards (`Price`'s new
   `showCompareAtPrice` prop), smaller/muted name text, no circle behind the
   overlay wishlist heart, and "Sold Out" moved into the top-left badge slot
   as small red text instead of a bottom-left pill. Replaced the old
   `CampaignImage` + `BlackEditSection` + standalone "Best Sellers"
   `HomeSection` trio with one new `scroll-showcase-section.tsx` (deleted
   `black-edit-section.tsx`) — see §10 for the scroll-linked background morph
   and desktop sticky follow-along gallery mechanics; Best Sellers content was
   folded into it as the first chapter rather than kept separate, to avoid
   showing the same products twice. Verified with `tsc --noEmit` + `npm run
   lint` + `npm run build` clean, plus an ad-hoc Playwright pass at
   390/768/1440px confirming: hero autoplay/pagination, nav
   transparent-then-solid transition (and unaffected on `/shop`), text-free
   Collections tiles, 6-product New Arrivals with the new quiet card
   treatment, the showcase's background genuinely morphing white → near-black
   → white on scroll, the desktop sticky image crossfading in step with which
   row is active (confirmed the active-row tracking is correct under
   realistic incremental scroll — an initial test using a single large
   instant `scrollBy` jump looked like it picked the wrong row, but that was
   an artifact of the synthetic instant jump, not a real bug: real
   mouse-wheel/momentum scrolling, tested step by step, tracked monotonically
   correctly), the mobile fallback grid with no pinning, and no PDP/cart/shop
   regressions from the shared `ProductCard`/`Price`/`WishlistButton` changes.

## 13. Explicitly out of scope (per the original brief, still true)

No Supabase/database, no real auth, no payment gateway, no real shipping API,
no admin panel, no real order management. The data-service layer (§7) exists
specifically so these can be added later without UI rewrites — when that work
starts, it replaces the bodies of `lib/services/*.ts` functions, not their
call sites.
