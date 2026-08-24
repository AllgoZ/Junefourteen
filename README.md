# Junefourteensite
Premium women's ethnic-contemporary fashion — frontend prototype built with Next.js
(App Router), TypeScript, Tailwind CSS, and shadcn/ui.

This is a **frontend-only prototype**: no backend, database, auth, or payment
processing. Product data is mock data (`lib/mock-data/`), and cart/wishlist/recent
searches persist to `localStorage`. See `prompt files/initialize.md` for the full
brief.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/` — routes (App Router)
- `components/` — `layout/`, `navigation/`, `product/`, `cart/`, `wishlist/`,
  `search/`, `checkout/`, `home/`, `marketing/`, `providers/`, `ui/` (shadcn
  primitives + shared atoms)
- `lib/` — `mock-data/` (products, collections, size chart), `services/` (async
  data-access functions — the seam for a future Supabase swap), `config/`
  (site/brand config), plus format/validation/storage utilities
- `types/` — shared TypeScript types
- `hooks/` — shared client hooks

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint

## Architecture Notes

- **Data layer**: `lib/services/products.ts` and `lib/services/shipping.ts` expose
  async functions (`getProducts`, `getProductBySlug`, `getShippingEstimate`, etc.)
  that currently read mock data. UI components call these functions rather than
  importing mock data directly, so swapping in Supabase later shouldn't require UI
  rewrites.
- **Cart / Wishlist / Recent Searches**: backed by `localStorage` via a small
  external-store helper (`lib/local-store.ts`) read through `useSyncExternalStore`,
  avoiding SSR/hydration mismatches without needing an effect-based hydration step.
- **Product imagery**: `components/ui/tonal-placeholder.tsx` renders a deterministic
  grayscale placeholder seeded by each image's `tone` value; `components/product/product-image.tsx`
  and `components/ui/editorial-image.tsx` switch to `next/image` automatically once
  a `src` is present. Dummy product photography currently lives in `public/images/`
  and is assigned to products/collections via `lib/mock-data/gallery-images.ts`.
