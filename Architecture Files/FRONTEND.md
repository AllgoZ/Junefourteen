# JUNEFOURTEEN — Frontend Guide

This is the practical, "about to write UI code" companion to `ARCHITECTURE.md`
— conventions, reusable pieces, and the rules that are load-bearing rather
than incidental. `ARCHITECTURE.md` stays the authoritative history/rationale
record (see its §4/§6/§8/§10 for the source material this doc distills); when
the two disagree, trust `ARCHITECTURE.md` and fix this file.

## 1. Stack

- **Next.js 16.3.0**, App Router, Turbopack (the default build/dev engine in
  this install — no separate opt-in flag).
- **React 19.2.8**. `params`/`searchParams` are Promises everywhere — `await`
  them, type with `PageProps<'/route'>`/`LayoutProps<'/route'>`.
- **Tailwind CSS v4** (`@tailwindcss/postcss`, CSS-first config via
  `app/(site)/globals.css`'s `@theme inline` block — there is no
  `tailwind.config.ts`).
- **shadcn/radix-ui** (`radix-ui` v1 umbrella package, `class-variance-authority`
  for variants) for primitives — `components/ui/`.
- **motion** (`motion/react`, the renamed Framer Motion package) for the small
  set of genuinely scroll-linked sections.
- **lucide-react** for icons.
- **sonner** for toasts (`<Toaster>` mounted once in `app/(site)/layout.tsx`
  and again in the admin layout).
- No global state library — see §6.

## 2. Two apps, two root layouts

`app/(site)/` (storefront) and `app/admin/` (CMS) are separate route groups,
**each with its own root layout** (own `<html>`/`<body>`, own font/provider
tree). The `(site)`/`(protected)` folder names are stripped from the URL —
they don't change the public route table, they exist purely to scope layouts
and, for `(protected)`, to gate every route under it behind `requireAdmin()`
in one place rather than per-page.

Inside `app/admin/`: `login/` is the one ungated route (gating it would
redirect it to itself); everything under `(protected)/` requires an admin
session, enforced twice — once in `proxy.ts` (repo root; Next 16 renamed
`middleware.ts`) before the route even renders, and again inside every
Server Action via `requireAdmin()` (`lib/auth/dal.ts`), because actions are
reachable by direct POST, not just through the gated UI. If you add a new
admin action, call `requireAdmin()` as its first line — don't rely on the
proxy alone.

## 3. Directory map (frontend-relevant slice)

```
components/
  ui/          shadcn primitives + shared atoms: EditorialImage, TonalPlaceholder,
               EmptyState, AdminCard (admin/ui/card.tsx) — start here before
               writing a new primitive, most needs are already covered
  layout/      Container, SiteHeader, SiteFooter, MobileNav
  home/        Homepage sections (hero, collections, scroll showcase, campaign
               banner, social grid) — see §7 below
  product/     Card/grid/gallery/image, size & custom-size flow, add-to-bag panel
  cart/        Drawer, line item, shipping estimator
  checkout/    Checkout form + order summary
  account/     Sign-in/up forms, orders/addresses/profile panels
  shop/        FilterBarDesktop (Popover bar), FilterSheet/SortSheet (mobile)
  admin/       Admin nav + every entity form (product/collection/banner/
               shipping-zone/coupon/campaign-banner/gallery-images-form) —
               see §8 for the shared form pattern
  providers/   CartProvider, WishlistProvider (§6)
hooks/         use-recent-searches.ts
lib/config/site.ts   Brand config — the only place to change brand name/nav/
                     footer links/social. Never hardcode "JUNEFOURTEEN" as a
                     literal string; always `site.name` etc.
lib/shop-filters.ts  SORT_OPTIONS/PRICE_BANDS/parseShopSearchParams() — the
                     single place URL search params become filter state
types/         product.ts, cart.ts, shipping.ts — shared domain types
```

## 4. Design tokens

All in `app/(site)/globals.css`, plain hex (not oklch), exposed as Tailwind
utilities via `@theme inline`:

| Token | Value | Use |
|---|---|---|
| primary black | `#0A0A0A` | text, primary surfaces |
| secondary black | `#171717` | hover/emphasis |
| white | `#FFFFFF` | |
| warm canvas (`bg-offwhite`) | `#FAF9F6` | page background |
| soft surface (`bg-muted`) | `#F5F5F3` | cards, subtle fills |
| border | `#E7E5E2` | |
| muted text | `#6B6B6B` | |
| subtle text | `#8A8A8A` | |
| `--color-amber` | `#FFAB00` | defined, **unused** — don't reach for it without a real reason |
| `--color-near-black` / `--color-warm-white` | `#050505` / `#F5F2EE` | Black Edit chapter only, don't reuse elsewhere |

**Radius**: base `--radius: 0.75rem` (12px) drives `sm/md/lg/xl/2xl`. Bottom
sheets use a larger `rounded-t-[1.75rem]`.

**Typography** — three typefaces, each with a narrow, deliberate job:
- **Inter** — the UI sans, everything by default. Every heading is sans with
  `font-medium tracking-tight`, not a serif or bold display face.
- **Fraunces** (serif) — genuine editorial moments only (About page). Don't
  reach for it for a heading just because it "feels premium" — that's not
  what it's reserved for here.
- **Montserrat semi-bold** (weight `600` only) — the brand wordmark
  "JUNEFOURTEEN" exclusively, in `SiteHeader` and `MobileNav`'s sheet header.
  Replaced Fraunces there per direct request; don't reintroduce serif for the
  wordmark.

All three load via `next/font/google` with `display: "swap"` in
`app/(site)/layout.tsx` — self-hosted at build time, zero runtime request to
Google's CDN (see OPTIMIZATION.md §3).

**Quiet-label style**: `text-xs font-medium tracking-[0.2em] uppercase` is
the recurring "small caps section label" look — homepage section headings,
`MobileNav` top-level items, the hero's "Shop Now" corner link. Reach for
this before inventing a new small-label treatment.

## 5. Core reusable components — check these before writing a new one

- **`components/layout/container.tsx`** — the single source of horizontal
  page boundaries. `max-w-[1440px]` default; `size="form"` (5xl, checkout),
  `"medium"` (3xl), `"narrow"` (2xl, cart/account/static pages). All share
  `px-4 sm:px-8 lg:px-12`. A few homepage sections deliberately use a
  *tighter* custom gutter (`px-1`/`px-2`) instead — don't "fix" that back to
  the standard gutter, it's intentional (keeps the locked 2-col mobile grid
  reading large).
- **`components/ui/editorial-image.tsx`** — real photo via `next/image` if
  `src` is present, else `TonalPlaceholder`. Used for all non-product imagery
  (hero, collections, campaign banner, social grid). Takes `tone` (0–1,
  seeds the placeholder gradient deterministically), `aspect`, `decorative`
  (sets `aria-hidden`, empty `alt`), `objectPosition` (CSS value, for biasing
  a crop toward faces on wide/short ratios).
- **`components/product/product-image.tsx`** — the same fallback pattern,
  independently implemented, for `ProductImage` objects specifically
  (`{id, alt, tone, src?}`). Not shared code with `EditorialImage` — a known
  small duplication, fine to leave unless you're touching both.
- **`components/ui/tonal-placeholder.tsx`** — the actual placeholder
  (deterministic grayscale gradient + centered `Shirt` icon) and
  `ASPECT_CLASSES`, which backs every image wrapper site-wide: `portrait`
  (`aspect-[4/5]`, PDP gallery/cart/wishlist/search) vs `gridCard`
  (`aspect-[3/4]`, product grids only — kept separate so grid-density tweaks
  never ripple into the PDP gallery).
- **`components/admin/ui/card.tsx`** (`AdminCard`) — the standard admin
  section wrapper (`title`/`description`/children). Every admin page is
  built from a stack of these.
- **`components/product/add-to-bag-panel.tsx`**'s `PRIMARY_CTA`/
  `SECONDARY_CTA`/`STICKY_CTA` — the one place elevated CTA styling
  (taller, `rounded-2xl`, layered shadow, `active:scale-[0.97]`) lives.
  Scoped to Add to Bag/Buy Now, not a global `Button` variant — don't apply
  it elsewhere without a reason.
- **`components/ui/empty-state.tsx`** — typography-first empty states, no
  icon-in-a-circle. Headline + one line + CTA, nothing more.

## 6. State management

**Cart, wishlist, and recent searches are all `localStorage`-backed**, one
shared pattern (`lib/local-store.ts`):

```ts
createLocalStore<T>(key, fallback) → { getSnapshot, getServerSnapshot, subscribe, set }
```

consumed via React's `useSyncExternalStore` in `CartProvider`/
`WishlistProvider` (both mounted once in `app/(site)/layout.tsx`) and
`hooks/use-recent-searches.ts`. This is unchanged by the real backend — an
authenticated user's server-side cart layers reconciliation on top of the
same local store rather than replacing it (see `ARCHITECTURE.md` §16).

**Do not use `useState` + `useEffect` to hydrate browser-only state.** It
trips `react-hooks/set-state-in-effect`, which `eslint-config-next`'s
`core-web-vitals` config enforces as a hard **error** here (see §9 below).
`useSyncExternalStore` is also just the more correct tool for this —
follow the existing pattern for any new localStorage-backed state.

`useCart()`: `items`, `itemCount`, `subtotal`, `isOpen`/`openCart`/
`closeCart`, `addItem`, `updateQuantity`, `removeItem`, `clearCart`.
`useWishlist()`: `items`, `count`, `isWishlisted`, `addItem`, `removeItem`,
`toggleItem`.

There is no Redux/Zustand/Context-for-server-data anywhere — data fetched on
the server (products, collections, orders, admin content) flows down as
props from Server Components, full stop.

## 7. Data fetching pattern

Pages are `async` Server Components that `Promise.all([...])` every fetch
they need up front (see `app/(site)/page.tsx` for the canonical example —
six parallel fetches, not six sequential `await`s) and pass plain data down
as props. `lib/services/*.ts` functions are the fetch boundary — most wrap a
`lib/repositories/*.ts` query in `unstable_cache` (tags + `revalidate: 3600`)
so a Server Component never has to think about caching itself; see
`OPTIMIZATION.md` §3 for the full tag list and invalidation story.

**Fallback convention**: every admin-manageable homepage content type
(banners, social links, shipping zones, tax, the campaign banner, the
gallery grid) falls back to a hardcoded default when its table has zero
rows — the homepage never renders empty. If you add a new admin-editable
section, follow this shape: `const value = dbValue ?? HARDCODED_FALLBACK`
(or `.length > 0 ? dbValue : FALLBACK` for lists), computed in the Server
Component or the section component itself, not buried in the service layer.

## 8. Forms & Server Actions

Every admin entity form (`product-form.tsx`, `collection-form.tsx`,
`banner-form.tsx`, `shipping-zone-form.tsx`, `coupon-form.tsx`,
`campaign-banner-form.tsx`, `gallery-images-form.tsx`) follows one shape:

```tsx
"use client";
const [state, action, pending] = useActionState(saveXAction, {});
useEffect(() => {
  if (state.xId /* or state.success */) {
    toast.success("Saved.");
    router.push("/admin/x"); // the list page, not back to the edit page
  }
}, [state.xId, router]);

return (
  <form action={action}>
    {/* AdminCard-wrapped fields */}
    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
  </form>
);
```

Fires a toast and redirects to the **list** page on success — create and
update alike. A per-row/per-image upload widget that lives outside the main
`<form>` (e.g. `ProductImagesManager`, `GalleryImagesForm`'s per-tile forms)
reports its own `pending` state up to the parent via an `onUploadingChange`
callback so the main Save button can disable itself for the duration —
nested `<form>` elements are invalid HTML and get silently reparented by the
browser, so a sibling upload form is the only option, and without this
callback the parent has no way to know an upload is in flight.

**Live image preview before upload**: don't use `next/image` for a
not-yet-uploaded file — its `src` can only be a real URL, not a `blob:`
object URL. Use a plain `<img>` (see `BannerPreviewFrame`,
`CampaignBannerForm`, `GalleryImagesForm`) with
`src={preview ?? existingUrl}` where `preview` is set from
`URL.createObjectURL(file)` in the file input's `onChange`.

**Cloudinary uploads**: every image-carrying Server Action follows
`if (file instanceof File && file.size > 0) { upload, delete old if
replacing, else keep existing url }` — see `lib/cloudinary/admin.ts`. The
global Server Action body size limit is 10MB (`next.config.ts`'s
`experimental.serverActions.bodySizeLimit`) — a real camera/phone JPG can
exceed Next's 1MB default, which is why this is raised globally rather than
per-route.

## 9. Frontend-specific gotchas

- **React Compiler lint rules are enforced as errors**, not warnings
  (`eslint-config-next`'s `core-web-vitals`), even though the compiler
  itself isn't currently enabled (see `OPTIMIZATION.md` §5) — the codebase
  is written *compiler-ready*. Concretely: no `Date.now()`/`Math.random()`
  during render, even inside a named handler function that's merely
  *referenced* as a prop (`react-hooks/purity` wants it recognizable as an
  event handler at the callsite — inline the whole function in the JSX prop
  if this trips).
- **`server-only` taints the whole file it's imported into**, not just the
  export you use — a client component importing even an unrelated named
  export from a file that also imports something `server-only`-guarded
  (`lib/supabase/admin.ts`, `lib/cloudinary/admin.ts`) fails the build. If a
  small constant needs to be shared between a server-only-adjacent file and
  a client component, extract it to its own zero-dependency file (see
  `lib/config/indian-states.ts`).
- **`getComputedStyle(el).transform`, not `.scale`**, when checking whether
  a Tailwind `scale-*` hover transform actually applied — `scale` is its own
  CSS property in modern browsers, separate from `transform`.
- **`params`/`searchParams` are Promises** in `page.tsx`/`layout.tsx`/
  `generateMetadata` — must `await`.
- Full list, including framework/build gotchas outside the frontend proper:
  `ARCHITECTURE.md` §9.

## 10. Responsive rules — some of these are locked, don't "fix" them

- **Product grids**: `grid-cols-2` on mobile/tablet is **deliberately
  locked** below the `lg:` breakpoint — an explicit standing instruction
  after a prior regression. Steps up to `lg:grid-cols-3`, `xl:grid-cols-4`.
  Applies to `product-grid.tsx` (backs `/shop`, `/collections/[slug]`,
  `/search`, PDP related products, homepage New Arrivals) and
  `wishlist-grid.tsx` (hand-rolled, apply the same breakpoints by hand if
  you touch grid density again).
- **No horizontal scroll-snap product rails anywhere** — PDP related
  products, New Arrivals, Best Sellers all render a plain capped
  `<ProductGrid>`. The hero's own scroll-snap carousel is a deliberate,
  narrow exception scoped to hero banners specifically — don't generalize it
  into a product rail pattern.
- Filters split by breakpoint: `FilterBarDesktop` (Popover-per-facet,
  immediate-apply) at `lg:`+, `FilterSheet`/`SortSheet` (staged draft +
  Apply, bottom sheet) below it — both write the same URL params, so the
  filtering logic itself never branches on breakpoint.

## 11. Animation

`motion/react` is used narrowly, not as a default for "make this feel
nicer": the hero carousel's scroll-snap track (native CSS, not `motion`),
and `components/home/scroll-showcase-section.tsx`'s two scroll-linked
pieces — a `motion.div`-per-row `onViewportEnter` driving which product is
"active" in the sticky Best Sellers layout, and `BlackChapter`'s own
`useScroll`-driven `backgroundColor` interpolation, deliberately scoped to
its own subtree (not the combined container) so its color transition can
never start early depending on how tall the section above it renders. If you
add a new scroll-linked effect, scope its `useScroll` ref the same way —
to the smallest subtree that should drive it, not a shared ancestor.

Everywhere else, motion is plain CSS: `transition-transform duration-700`
hover zooms (Collections tiles), `transition-all duration-500 ease-out
group-hover:scale-[1.03]` (product card images) — small, "premium," never a
distraction.

## 12. Accessibility patterns already in place

- Skip-to-content link (`app/(site)/layout.tsx`, `sr-only` until
  focus-visible).
- `decorative` prop on `EditorialImage`/`ProductImage` usage sets
  `aria-hidden` + empty `alt` for images that are purely visual (social grid
  tiles, campaign banner) — the accessible name lives on the wrapping
  `Link`'s `aria-label` instead where relevant (e.g. Collections tiles,
  which carry no visible text at all).
- Focus-visible states throughout use the shared `focus-visible:ring-3
  focus-visible:ring-ring/50` treatment from shadcn's base input/button
  styles — don't hand-roll a different focus ring.

## 13. Where to go next

- `ARCHITECTURE.md` — full history, backend/data model, admin CMS feature
  inventory, chronological "why" for every non-obvious decision.
- `SECURITY.md` — auth/authorization/payment security audit.
- `OPTIMIZATION.md` — caching, image/font pipeline, and performance audit.
- `ADMIN_CMS_AUDIT.md` — admin feature-parity backlog vs. Shopify Admin.
