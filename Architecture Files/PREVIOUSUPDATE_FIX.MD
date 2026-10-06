# JUNEFOURTEEN — Previous Update & Fix Log

A short, **recency-ordered** record of what shipped most recently and why —
read this before `ARCHITECTURE.md`'s full history (§12, same folder) if
you just need "what happened lately" rather than the whole project story.
Each entry names the commit(s), the files touched, and — for a fix — the
actual root cause, not just the symptom. `ARCHITECTURE.md` remains the
authoritative record; this file is a fast-read companion to it, not a
replacement. If the two ever disagree, trust `ARCHITECTURE.md`.

All commits below are pushed to both remotes (`origin` →
github.com/AllgoZ/Junefourteen, `site-repo` →
github.com/AllgoZ/junefourteensite), which are kept in sync.

---

## 2026-10-06 — Quantity stepper capped at available stock

The PDP's quantity stepper had no upper bound at all — a visitor could
click "+" past however many units were actually in stock, independent of
the low-stock message/badge (previous two entries) that warns about it
without ever constraining the picker itself.

Fix: a new `atMaxQuantity` flag (`quantity >= product.stockQuantity`, same
"`undefined` only for the historical mock catalog" carve-out the other
stock-aware code already uses). The "+" button disables once reached and
a small "Only N available" note appears under the stepper; the increment
handler also clamps directly (`Math.min(stockQuantity, q + 1)`) rather
than relying on the disabled attribute alone. No change to validation or
the add/checkout actions — checkout already re-validates everything
server-side regardless, and there's no free-text quantity input to work
around the stepper with.

**Verified**: `tsc`/`lint`/clean `next build`; headless Chromium against
three real products at different stock levels — stock 8 stops at 8
(button disables, hint shown), stock 4 stops at 4, and a stock-20 control
reaches 11 after 10 clicks with the button still enabled, confirming
normal-stock products aren't capped prematurely.

Docs: `ARCHITECTURE.md` new §29; `walkthrough.md`'s Products/Inventory
sections corrected — they previously (and now incorrectly) said only the
Sold Out toggle blocks a purchase, which stopped being true once stock
reaching 0 became its own independent gate.

---

## 2026-10-06 — Low-stock/out-of-stock badge on the product grid card

Reported as "the low-stock count doesn't show on the products page."
Audited first, not assumed: a fresh `next build` confirmed the PDP
message already worked correctly for the real product in question
(`venmugil-mauve`, `stock_quantity: 8`) — my first `curl`+`grep` check
looked like a miss but was just React's SSR comment markers around the
interpolated number breaking a naive regex, not an actual bug. The real
gap: `ProductCard` (every grid listing — shop, collections, best sellers,
new arrivals, wishlist) never had a low-stock/out-of-stock indicator at
all, which is what the Shopify comparison in the report was pointing at.

Added the identical rules the PDP already had into the card's existing
top-left badge slot (which already prioritized Sold Out → New → Sale):
new order is Sold Out → Out of Stock → Only N Left → New → Sale →
nothing, with the new states sharing the same background-pill treatment
the existing Sold Out badge already used.

**Verified**: `tsc`/`lint`/clean `next build`; headless Chromium against
`/shop` confirmed "Only 8 Left" renders correctly in red on Venmugil
Mauve, and a full-grid screenshot shows several other low-stock products
flagged correctly alongside unaffected New/Sold Out badges.

Docs: `ARCHITECTURE.md` new §28, §26's PDP note cross-referenced.

---

## 2026-10-05 — Persistent "added to your bag" confirmation (replaces the toast)

Direct follow-up to the toast-polish fix below: it looked better, but was
still a `sonner` toast, so it still auto-dismissed after a few seconds —
not what was wanted specifically for Add to Bag ("shouldn't disappear
until I leave the product"). Scoped to `add-to-bag-panel.tsx` only — the
wishlist move-to-bag toast and every other toast stay untouched.

- `handleAddToBag` no longer calls `toast.success(...)`. It now always
  sets a persistent `addedToBag` snapshot (thumbnail/name/price/qty),
  guest or authed — for guests it sits underneath the existing mobile
  sign-in popup and stays once that closes, same as the cart drawer
  already did.
- No auto-dismiss: plain `useState`, cleared only by its own close
  button, by "View Bag" (which also opens the cart), or by leaving the
  page. Verified directly (not assumed) that the App Router already
  remounts this component on a product-to-product navigation, so no
  extra reset effect was needed — added one, hit
  `react-hooks/set-state-in-effect`, tested whether it was actually
  necessary, confirmed it wasn't, removed it.
- Mutually exclusive with the existing scroll-triggered sticky "Add to
  Bag" bar — both are fixed-bottom, so the sticky bar's condition gained
  `&& !addedToBag` to stop them stacking.
- Richer + responsive: thumbnail, name, "Qty N · price", "View Bag" —
  full-width bar on mobile, a compact floating card bottom-right on
  desktop, one component via breakpoint classes.

**Verified**: `tsc`/`lint`/clean `next build`; headless Chromium — correct
details shown, still visible after 5s (no auto-dismiss), no stacked
bottom bars, View Bag opens the cart and dismisses it, doesn't carry over
to a different product, desktop card lands exactly at the expected
bottom-right offset.

Docs: `ARCHITECTURE.md` new §27, §26's toast note corrected.

---

## 2026-10-05 — Stock-aware PDP, toast polish, stale-checkout-total fix

Direct follow-up to the buy-flow pass below: low-stock urgency messaging,
restricting purchase at 0 stock, a better-looking "View Bag" toast, and a
real display bug in the checkout total. Six files: `lib/repositories/
products.ts`, `types/product.ts`, `lib/mappers/product.ts` (wiring
`stock_quantity` to the storefront for the first time — it was admin-only
before), `add-to-bag-panel.tsx`, `components/ui/sonner.tsx`,
`checkout-content.tsx`.

1. **Low-stock message**: `0 < stockQuantity < 10` shows "Only N left in
   stock — order soon" in the site's existing `text-destructive` red
   token on the PDP. Uses a fixed threshold of 10, deliberately separate
   from the admin's own configurable `low_stock_threshold` (that one only
   drives the admin inventory dashboard's badge — different audience).
2. **0-stock purchase gate**: `stockQuantity === 0` now disables Add to
   Bag/Buy Now, independent of (in addition to) the existing manual
   `is_sold_out` flag. Deliberately not merged into the Sold Out →
   Request to Order flow — that stays tied only to the admin's explicit
   flag, since incidental stock depletion isn't the same decision as
   "switch this to pre-order."
3. **Toast action button**: the bottom-center "Added to your bag"/"View
   Bag" toast (same for the wishlist move-to-bag toast) had a completely
   unstyled action button by default — now matches the site's own
   black-pill `Button` styling via `toastOptions.classNames.actionButton`
   in `components/ui/sonner.tsx`, one shared fix for both occurrences.
4. **Stale checkout total, root-caused**: line items/subtotal were always
   correctly reactive; `delivery.amount` and a coupon's `discountAmount`
   are one-time snapshots that were never invalidated when the cart
   changed after they were fetched/applied (e.g. removing an item from
   the cart drawer while on checkout) — only an address edit reset them.
   Fixed with a new effect that resets both (with a toast for the coupon
   case) whenever the cart's subtotal changes, plus adding `delivery` to
   the existing estimate effect's own dependency array — without that
   second part, the reset alone left the page frozen on "Enter your state
   and PIN code…" because that effect had no way to notice `delivery` had
   changed out from under it in a separate render pass. Purely a display
   bug — `createOrderAction` already re-validates everything server-side
   at order time regardless, so nothing was ever at risk of overcharging.

**Verified**: `tsc`/`lint`/clean `next build`; headless Chromium against a
local prod server — a real 0-stock product shows "Out of Stock" with both
buttons gated, a real 4-left product shows the red message with Add to
Bag still enabled, a 20-in-stock control shows neither; the wishlist
toast's action button computed styles confirm the black-pill treatment;
a two-item guest checkout with a live ₹120 shipping estimate, after
removing one item via the cart drawer, re-estimates fresh and the grand
Total updates to match instead of staying frozen at the old two-item
amount.

Docs: `ARCHITECTURE.md` §14 (products table, `stock_quantity` note
corrected), new §26.

---

## 2026-10-05 — Buy-flow UX pass: mobile popup, cart lag, checkout polish

Audited the full "Buy" journey (product page → mobile sign-in popup → cart
→ checkout) against a direct complaint that it "feels stuck" on mobile and
"blunt" overall, then fixed what the audit found — four files touched, all
additive/CSS-scoped, no admin/pricing/order logic changed.

1. **Mobile sign-in popup felt stuck behind the keyboard.**
   `mobile-signup-dialog.tsx` never got the `dvh`/top-anchored fix already
   proven on `request-to-order-dialog.tsx` (`FRONTEND.md`'s dvh-vs-vh
   gotcha). Same `className` fix applied; desktop (`sm:`+) unchanged.
2. **"Add to Bag" as a guest led nowhere after the popup.** It opened the
   popup but, unlike Buy Now, did nothing once the popup closed — guest
   landed back on the same page with only a toast. `add-to-bag-panel.tsx`
   now opens the cart drawer once the popup closes (submitted or
   dismissed), matching Buy Now's existing "always proceeds regardless"
   rule. Already-authed guests still just get the toast, unchanged.
3. **Cart quantity updates visibly lagged/flickered for signed-in users.**
   Root cause: every +/- click fired a Server Action *and* a full cart
   refetch, with no debounce — rapid clicks raced each other and could
   visibly revert-then-correct. `cart-provider.tsx#updateQuantity` now
   debounces its write (~400ms) and never refetches afterward (a quantity
   change never needs a new `lineId`); `removeItem` likewise stops
   refetching and cancels any pending debounced write for that line.
   `addItem` deliberately keeps its post-write refetch — a new line's
   `lineId` is only a client-side placeholder until that refetch supplies
   the real `cart_items.id`, which `updateQuantity`/`removeItem` need to
   target the right row.
4. **Checkout read visually blunter than the product page.** Conservative,
   additive-only polish on `checkout-content.tsx`: the existing
   `--shadow-subtle` token (already used in the admin, previously unused
   on the storefront) on the step badges and the Delivery/Coupon/Payment
   info cards; the Order Summary box gained the same shadow +
   `rounded-xl` + `bg-card`; "Place Order"/"Complete Payment" now uses the
   same elevated-CTA treatment as the PDP's Add to Bag/Buy Now buttons. No
   shared `components/ui/*` primitive touched.

**Verified**: `tsc`/`lint`/clean `next build` all pass; headless Chromium
against a local prod server confirmed all four fixes end to end (popup
position on a 390×844 viewport vs. desktop, cart-drawer-opens-after-popup
for both submit and dismiss, Buy Now still reaches `/checkout`, four rapid
quantity clicks settle instantly with no flicker) plus a full-page
screenshot of the polished `/checkout`.

Docs: `ARCHITECTURE.md` §16 (cart sync behavior corrected to match),
new §25; `FRONTEND.md`'s dvh/keyboard gotcha entry.

---

## 2026-09-15 — Default size chart image + fix intermittent "Add new product" photo-upload error

Three related admin fixes/additions, all scoped to the product form.

**Default size chart** — every product without its own uploaded size-chart
image used to fall back to the generic measurement table in the PDP's
"Size Guide" popup. It now falls back to a shared default chart image
instead (a per-product upload still takes priority, unchanged).
`Architecture Files/size chart.jpeg` (user-supplied) uploaded once to
Cloudinary at a fixed public id (`size-charts/default-size-chart`, so a
future replacement is just a re-upload to the same id); the resulting URL
is a new `DEFAULT_SIZE_CHART_IMAGE` constant in `lib/mock-data/size-chart.ts`,
wired into the one fallback branch in
`lib/mappers/product.ts#dbProductToProduct`. The generic table component
(`SizeGuideContent`) is untouched, just no longer reached through this path.

**Root-caused the intermittent "page shows error" on Add New Product**:
the create form's "Product Images" card (added in the previous entry below)
bundled every selected file's raw bytes into the same `saveProductAction`
submission as the rest of the form. A single photo is fine, but a handful
of full-size camera photos together could push that one request past the
10MB Server Action body cap (`next.config.ts`) — even though each file was
comfortably under the per-file 8MB limit already enforced in
`validate-image.ts` — and the whole save would fail with an opaque,
intermittent error that depended entirely on how many/how large the photos
happened to be.

**Fix**: `components/admin/product-form.tsx`'s create-only image field
(`NewProductImagesField`) now uploads each file to Cloudinary the instant
it's chosen — its own small request per photo (`uploadDraftProductImageAction`,
a new Server Action called directly, the same way `reorderProductImagesAction`
already is, not through a `<form>`) — and only the resulting small JSON
metadata (`{imageUrl, cloudinaryPublicId, width, height}`) travels with the
main "Save Product" submission, the same hidden-JSON-input convention
`PiecesField` already uses. No raw image bytes ever reach the big
submission anymore, so the body-size failure mode is gone.

This also gives the create page the same **visual cue + Save-button gate**
the edit page's image manager already had: each photo gets its own
thumbnail with a spinner while uploading (or an inline error if that one
file fails, instead of the whole form failing), and the field reports its
"any upload still in flight" state up through the same `onUploadingChange`
callback `product-images-manager.tsx` already used — disabling "Save
Product" and showing "Waiting for image upload…" until every photo is
done, on create as well as edit.

Verified: `tsc`/`lint`/`build` clean; a clean `next build` still prerenders
`/product/[slug]`'s known paths; a local prod server confirms the default
chart URL appears for a product with no chart of its own
(`emerald-grace`) while a product with its own chart still serves that one
(`kanakavalli-wine-raw-silk`).

Docs: `ARCHITECTURE.md` §14 (products table), §17 (admin product form).

---

## 2026-09-11 — Fix: "Add new product" had no way to upload the main product photos

**Symptom**: on `/admin/products/new`, there was no product-photo upload
option anywhere on the page — only the newer Size Chart/Pieces & Pricing
cards. Reported as the photo uploader having "disappeared."

**Root cause**: `ProductImagesManager` (the add/reorder/delete tool for a
product's photo gallery) has needed a real, already-saved product id since
the very first admin CMS commit — its Cloudinary folder (`products/<id>`)
and the `product_images` foreign key both require one, so `product-form.tsx`
has always gated it with `{product && <ProductImagesManager .../>}` and it
never rendered on the create page. Not a regression from the size-chart/
pieces work — that work just added two new cards to the create form with no
photo-upload counterpart, making the pre-existing gap far more noticeable.

**Fix, additive only**:
- `product-form.tsx` gets a new **Product Images** card, shown only when
  creating (`!product`) — a plain multi-file input, no reorder/delete UI
  since nothing exists to reorder yet.
- `saveProductAction`'s create path (`!id`) validates every selected file
  up front — same discipline as the existing size-chart image check, so a
  bad file fails the whole save before anything is created — then, right
  after the new product row is inserted, uploads each file to
  `products/<new id>` and inserts a `product_images` row per file in the
  order chosen (sequential awaits, since `addProductImage` derives
  `sort_order` from the current row count and concurrent inserts would
  race). The first file becomes the primary photo, exactly like the edit
  page's manager.
- The update path, `ProductImagesManager`, and its three actions (upload/
  delete/reorder) are untouched — audited them while here and found no bug:
  correct Cloudinary cleanup on delete, correct `sort_order` handling,
  correct `revalidateTag`/`revalidatePath` on every mutation.

`tsc`/`lint`/`build` clean; `/admin/products/new` and `/admin/products/[id]`
still build as the expected dynamic (`ƒ`) routes.

Docs: `ARCHITECTURE.md` §17 (corrected the now-stale "images manager is
edit-only" line).

---

## 2026-09-06 — Homepage offer popup (image-only, admin-managed)

A clean, minimalistic promotional popup on the homepage: one
admin-uploaded image (no text of its own — offer copy, terms, and the
call-to-action all live in the image), shown **once** when a visitor first
loads the site, with exactly two interactions — click the image (goes to
an admin-set link) or close it. It does not reappear for that visitor
until the admin uploads a *new* image.

**Entirely additive — no existing storefront or admin behavior changed.**
New files only, plus tightly-scoped additions to `app/(site)/page.tsx`
(mount the client island), `app/admin/(protected)/banners/page.tsx` (one
`AdminCard`), and `lib/supabase/types.ts` (the `offer_popup` Row/Insert/
Update block).

- **DB** — `supabase/migrations/0022_offer_popup.sql`: an `offer_popup`
  singleton table (same `id boolean primary key default true check (id)`
  trick as `tax_settings`/`homepage_campaign`), RLS-enabled with no
  policies (service-role only). `image_url`/`cloudinary_public_id`/
  `image_alt`/`image_width`/`image_height`, optional `link_href`,
  `display_width_px` (`check between 240 and 900 default 420`),
  `is_active`. **Seeded inactive with no image**, so the storefront is
  byte-identical until an admin sets one up. Applied to the live DB;
  schema verified by direct query.
- **Read path** — `lib/services/offer-popup.ts#getOfferPopup`
  (`unstable_cache`, tag `"offer-popup"`, `revalidate: 3600`), mirrors
  `getCampaignBanner`. Returns `null` unless the row is active *and* has
  an image.
- **Storefront** — `components/home/offer-popup.tsx`, a client island
  mounted once as the first child in `app/(site)/page.tsx`. Radix
  `Dialog` with a `sr-only` title + custom close button, image-only
  (wrapped in a `<Link>` when a link is set). Opens ~500ms after first
  load; every dismissal path (X, Escape, backdrop, clicking the image)
  writes `localStorage["jf:offer-popup-seen"] = <image URL>`, so it never
  reappears for that visitor until a new image is uploaded. Renders
  nothing in the SSR HTML (dialog closed) — homepage stays statically
  prerendered (`○`), no hydration mismatch.
- **Admin** — an "Offer Popup" `AdminCard` at the top of `/admin/banners`
  (`components/admin/offer-popup-form.tsx` → `saveOfferPopupAction` in
  `app/admin/(protected)/banners/offer-popup-actions.ts`,
  `lib/repositories/admin/offer-popup.ts`). Single-image card modelled on
  `CampaignBannerForm`: image upload (blob preview, old-asset cleanup,
  "Remove current image"), alt text, optional link, width input (clamped
  240–900), on/off toggle. Action does
  `revalidateTag("offer-popup", "max")` + `revalidatePath("/")`. Placed
  here by explicit request ("add a section or under Banners"); does not
  touch the banner CRUD table/actions on the same page.

**Verified** with headless Chromium against a local production build with
a real test offer row: popup opens ~500ms after load at the configured
width; the X button, Escape, backdrop-click, and clicking the image all
close it and persist to `localStorage`; a reload does **not** reopen it; a
visitor who dismissed a *different* image still sees the new one once;
clicking the image navigates to the link and closes. With the popup
inactive (the seeded default) the homepage HTML has no dialog markup at
all. Test row cleared from the live DB afterward. `tsc`/`lint`/`build`
clean.

Docs: `ARCHITECTURE.md` §4/§14/§17/§19, `backend.md` §4/§5/§6,
`FRONTEND.md` §3/§8/§9, `OPTIMIZATION.md` §2.

---

## 2026-09-05 — Transactional email via Resend (new-order alert + customer tracking/shipped emails)

Three additive server-triggered emails, no existing checkout/admin behavior
changed to make room for them:

1. **New-order alert to the team inbox** (`site.contactEmail`,
   `team.Junefourteen@gmail.com`) — fires once per order, on the
   `pending → paid` transition (not on cart/order-row creation, which can be
   abandoned before payment — see `ARCHITECTURE.md` §24 for why). Wired into
   both places that call `markOrderPaid`: `verifyRazorpayPaymentAction`
   (`app/(site)/checkout/actions.ts`) and the Razorpay webhook
   (`app/api/webhooks/razorpay/route.ts`) — whichever reaches "paid" first
   for a given order sends it, gated so the other can't send a duplicate.
2. **Tracking-added email to the customer** — `updateOrderTrackingAction`
   (`app/admin/(protected)/orders/actions.ts`) now emails `orders.email` when
   the admin sets a new/changed tracking number or URL (not on a no-op
   resave of the same values).
3. **Shipped email to the customer** — `updateOrderStatusAction` emails
   `orders.email` the moment an order's status genuinely transitions to
   `"shipped"` (not on every status-field resave).

New: `lib/email/resend.ts` (server-only Resend client, never throws —
matches this app's existing best-effort-notification discipline),
`lib/email/templates.ts` (HTML builders, escapes every interpolated value),
`lib/email/order-notifications.ts` (the three notify functions above).
`resend` added as a dependency (`npm audit`: 0 vulnerabilities after).

**Verified live**: a real send from the fallback sandbox sender
(`onboarding@resend.dev` — no domain is verified in the Resend account yet)
to `team.Junefourteen@gmail.com` came back `delivered` when polled from
Resend's own API, so the admin alert works today with zero further setup.
The customer-facing tracking/shipped path was **not** verified against a
real customer inbox — Resend's guidance is that reliable delivery to
arbitrary recipients needs a verified sending domain. Verifying one (e.g.
`junefourteen.in`, in the Resend dashboard) and setting `RESEND_FROM_EMAIL`
closes this gap with no code change.

Docs: `ARCHITECTURE.md` new §24, §2 (dependency), §20 (env vars).

---

## 2026-09-05 — Real favicon added (the site had never actually had one)

Added the brand's "JF" monogram (`app/logo/favicon.svg`, moved into place)
as the site's favicon, and along the way found that the site had **never
had a working one**: `app/(site)/favicon.ico` had sat there since the
original frontend prototype, but Next's `favicon.ico` file convention is
only honored at the literal top level of `app/` — **not** inside a route
group like `(site)/` — so it silently 404'd in production the whole time
(confirmed directly with a real build + server, not assumed).

- **`app/favicon.ico`** (moved to the true top level, multi-resolution
  16/32/48px — rasterized from the SVG with headless Chromium + assembled
  with `png-to-ico`, both one-off tools, not new project dependencies) — now
  correctly served at `/favicon.ico` and inherited by **both** `(site)/` and
  `admin/`'s separate root layouts from the one file.
- **`app/(site)/icon.svg`** and **`app/admin/icon.svg`** — the same
  monogram as SVG, one per root layout (this convention *is* route-group-safe,
  unlike `favicon.ico`) — Next auto-emits the modern `<link rel="icon"
  type="image/svg+xml">` tag, which browsers prefer over the `.ico` fallback.
- `app/logo/` (the drop-in source location) removed now that the file lives
  where it's actually used.

Verified with a real production build + server: `/favicon.ico` returns the
new file byte-for-byte; both `/` and `/admin/login` render both `<link
rel="icon">` tags (the shared `.ico` and their own `icon.svg`) in the actual
HTML `<head>`, not just in theory. No other code changed.

Docs: `ARCHITECTURE.md` §4 (repo structure) and new §9.18 (the route-group
gotcha, so nobody re-discovers this the hard way).

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
