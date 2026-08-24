# Admin CMS audit — current state vs. Shopify Admin

This document benchmarks the JUNEFOURTEEN admin CMS (`app/admin/`) against
Shopify Admin's feature surface, records what this session added, and lays
out a prioritized backlog for the gaps that remain. See `ARCHITECTURE.md`
§17 for the implementation details of everything marked Done below — this
file is the audit/backlog view, not a second copy of that write-up.

## What this session added

Three features the user asked for by name, built to match every existing
convention in the codebase exactly (route shape, server-action pattern,
soft-delete, Cloudinary upload flow — see `ARCHITECTURE.md` §17 for specifics):

1. **Banners** — `/admin/banners` (+ `new`/`[id]`). The homepage hero
   carousel is now a real `banners` table (multiple active rows = multiple
   carousel slides) instead of a hardcoded array. Each banner takes two
   independent image uploads — a required horizontal/laptop photo and an
   optional vertical/mobile photo that falls back to the laptop one when
   absent — each with its own drag-and-drop dropzone (or a "paste a URL
   instead" alternative), crop-focus sliders, and live preview
   (`components/admin/banner-image-field.tsx`). Also supports optional
   overlay copy per slide (badge, headline, subheading, primary + secondary
   CTA, offer badge — all opt-in, only rendered on the storefront when a
   headline is set) and a genuine hard delete, unlike every other
   admin-managed table.
2. **Inventory** — `/admin/inventory`. Per-product `stock_quantity`/
   `low_stock_threshold` columns, a bulk table with inline stock editing and
   status badges, plus the same two fields on the Product form. Deliberately
   **does not** change checkout/PDP purchase-gating — `is_sold_out` stays
   the only flag that blocks a purchase, so this session added visibility
   into stock levels without changing storefront behavior.
3. **Social links** — new card on `/admin/settings`. Footer icons and the
   homepage Instagram-grid link now read from a `social_links` table
   (editable list, replace-all-on-save) instead of the hardcoded
   `site.social` config, which remains as the empty-table fallback.

Both new content tables (`banners`, `social_links`) follow the same
"admin table, public-read RLS on `is_active = true`, storefront falls back
to a hardcoded default when empty" shape already used by `products`/
`collections` — so an unconfigured store never regresses to a broken or
empty section.

## Feature comparison

Legend: **Done** — exists and is usable · **Partial** — exists in a reduced
form · **Missing** — no admin surface at all today.

| Area | Shopify Admin has | This project | Status |
|---|---|---|---|
| **Products** | Full CRUD, media, variants w/ per-variant SKU & price, metafields, bulk editor | Full CRUD, multi-image upload/reorder, sizes/sleeve options as flat lists (no per-variant SKU/price) | Partial |
| **Inventory** | Per-variant, multi-location stock, transfers, reservations, low-stock alerts | Per-product stock count + threshold, single implicit location, no alerts/notifications | Partial |
| **Collections** | Manual + automated (rule-based) smart collections | Manual only | Partial |
| **Orders** | Full lifecycle: fulfillment, tracking, refunds/returns, partial refunds, order edits | List/detail + status update only; no refund or fulfillment/tracking-number flow | Partial |
| **Customers** | Full profiles, order history, tags, segments, merge | Read-only list | Partial |
| **Discounts / Marketing** | Percentage/fixed/BOGO codes, automatic discounts, email/SMS campaigns | None | Missing |
| **Gift cards** | Issue, redeem, track balance | None | Missing |
| **Online Store — Banners/Hero** | Theme sections editable via theme editor | Dedicated `banners` table + admin UI (this session) | Done |
| **Online Store — Navigation/menus** | Drag-and-drop menu builder for header/footer nav | Nav links hardcoded in `lib/config/site.ts`; not admin-editable | Missing |
| **Online Store — Social links** | Theme settings | Dedicated `social_links` table + admin UI (this session) | Done |
| **Online Store — Pages/Blog** | CMS pages + blog posts | Static pages (`/faq`, `/shipping`, etc.) are hardcoded route files, no CMS | Missing |
| **Settings — General/store details** | Store name, address, currency, timezone | None editable (`site.ts` constants) | Missing |
| **Settings — Payments** | Payment provider config, capture rules | Out of scope per original brief (§21) | Missing |
| **Settings — Checkout** | Custom fields, guest checkout toggle, abandoned-cart recovery | Guest checkout is always-on by design, no admin toggle; no abandoned-cart flow | Missing |
| **Settings — Shipping** | Zones, rates, carrier integration | Flat rate/logic hardcoded in `lib/services/shipping.ts` | Missing |
| **Settings — Taxes** | Tax regions/rates | Not modeled | Missing |
| **Settings — Locations** | Multi-warehouse | Single implicit location (matches Inventory's scope above) | Missing |
| **Settings — Notifications** | Editable email templates | Not modeled (no transactional email system beyond Supabase Auth's own emails) | Missing |
| **Settings — Staff & permissions** | Multiple staff accounts, role-scoped permissions | Single `role = 'admin'` flag; any admin has full access, no staff-account management UI | Missing |
| **Analytics** | Sales/traffic dashboards, reports | Dashboard has order/revenue/product counts + recent orders only, no trends/reports | Partial |
| **Apps / integrations** | App marketplace, webhooks | None | Missing |

## Prioritized backlog

**P1 — highest practical value for a store this size**
- Unified nav/footer menu editor (currently the single biggest "looks
  hardcoded" gap now that banners and social links are covered).
- Discount/coupon codes (percentage or fixed, single-use or code-based) —
  the most commonly requested marketing feature for a fashion storefront.
- Order refunds and a fulfillment/tracking-number field on order detail.
- Staff accounts with role-scoped permissions (today: one shared admin role).

**P2 — larger scope, real value but bigger lift**
- Multi-location inventory (only worth it once there's an actual second
  warehouse/location).
- Tax and shipping-zone rules (`lib/services/shipping.ts` is a hardcoded
  stand-in today).
- Analytics dashboard with trends over time, not just point-in-time counts.
- Abandoned-cart recovery emails.
- Automated/rule-based ("smart") collections.

**P3 — likely out of scope for a project this size**
- POS / omnichannel.
- Multi-currency.
- Full apps/webhooks marketplace.
- Gift cards.

## Notes on scope decisions made this session

- **Inventory is per-product, not per-variant.** Sizes/sleeve options are
  plain availability lists today (`product_sizes`/`product_sleeve_options`),
  not separately-stocked rows — matching the existing schema's granularity
  rather than introducing a new variant-SKU concept as a side effect of an
  inventory feature.
- **Stock tracking doesn't touch purchase-gating.** `is_sold_out` remains
  the only thing that blocks checkout. Wiring `stock_quantity <= 0` to
  auto-set `is_sold_out` is a natural P1-adjacent follow-up once there's
  confidence in how stock gets updated in practice (manual admin entry only,
  today — no order-driven decrement exists yet either).
- **Social links scope was kept narrow** — labels/URLs only, not the full
  nav/footer link-column system, to avoid touching the header/mobile-nav/
  footer structure more broadly than what was actually asked for.
