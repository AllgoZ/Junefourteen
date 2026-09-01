# JUNEFOURTEEN — Security Audit

A point-in-time review of this codebase's authentication, authorization,
payment, and data-handling security, done by reading the actual
implementation (not the brief/docs) — every claim below cites the file it
came from. See `ARCHITECTURE.md` §14/§15/§16/§17 for the underlying feature
write-ups this audit checks against.

**Scope**: application code in this repository (`app/`, `lib/`, `supabase/`,
`proxy.ts`, `next.config.ts`). Out of scope: Supabase's own infrastructure
security, Cloudinary's/Razorpay's own security posture, hosting-platform
configuration (Vercel/other), and anything in `node_modules`.

## Executive summary

Overall posture is **solid for a store this size**: authorization is
enforced server-side in two independent layers, payment confirmation is
cryptographically verified (not trusted from the client), every price is
recomputed authoritatively on the server, and RLS is the default-deny floor
under all of it. `npm audit` reports **zero known vulnerabilities** across
the dependency tree (checked at time of writing, re-checked again after the
hardening pass below). The gaps found were all **hardening opportunities,
not active exploits** — nothing here reflected attacker-observed behavior.

**Update — production hardening pass**: findings 1–4 below were
implemented in a dedicated hardening pass (`prompt files/hardening.md`).
See `ARCHITECTURE.md` §22 for the full implementation writeup. Findings 5–6
were evaluated and left as documented, accepted tradeoffs (not silently
dropped — see their sections below for why).

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | No Razorpay webhook — payment confirmation depended entirely on the client calling back | Medium | **Fixed** — `app/api/webhooks/razorpay/route.ts`, §22 |
| 2 | No security response headers (CSP, X-Frame-Options, etc.) | Low–Medium | **Fixed** — `next.config.ts#headers()`, §22 |
| 3 | No app-level rate limiting on auth/checkout/coupon Server Actions | Low–Medium | **Fixed** — `lib/rate-limit.ts`, §22 |
| 4 | Admin image uploads validated only `file.size > 0`, not MIME type | Low | **Fixed** — `lib/cloudinary/validate-image.ts`, §22 |
| 5 | Mobile-number signup has no OTP/ownership verification (by design, v1) | Low | Medium (product decision, not a quick fix) |
| 6 | No MFA / no password complexity beyond an 8-char minimum | Low | Medium |

## 1. Authentication

- **Customer auth**: Supabase Auth, email/password, email confirmation
  required by default (`lib/services/auth.ts`). Session cookies are managed
  entirely by the officially-maintained `@supabase/ssr` package
  (`lib/supabase/server.ts`, `proxy.ts`) — this app never hand-rolls cookie
  parsing, signing, or storage.
- **Every session read goes through `supabase.auth.getUser()`, never
  `getSession()`** (`lib/auth/dal.ts#verifySession`) — `getUser()` revalidates
  the JWT against Supabase Auth on each call rather than trusting the
  cookie's embedded claims unverified. This is the correct choice and is
  used consistently everywhere a session is checked (`proxy.ts` does the
  same).
- **Password policy**: minimum 8 characters (`lib/validation.ts#validateSignUp`),
  no complexity requirement, no MFA. This is a UX-layer check only — the
  actual enforcement boundary is whatever Supabase Auth's own project
  settings allow, so a request that bypasses this client/action-level check
  (a direct API call) is still bounded by Supabase's own policy, not
  unguarded. Reasonable for the current scale; MFA would be the next step up
  if this grows past a small storefront.
- **Mobile-number quick signup and sign-in** (`components/account/
  mobile-signup-dialog.tsx`, `lib/services/auth.ts#signInOrSignUpWithMobile`,
  `lib/validation.ts#validateMobile`) accepts a phone number with **no
  OTP/ownership verification**, in either direction — explicitly a
  documented tradeoff in the code's own comments, not an oversight.
  Originally only account *creation* worked this way; a same-day follow-up
  made returning-customer *sign-in* symmetric (rotate the account's
  password via the admin API, sign in with the fresh one — the old copy
  told a returning customer to "sign in from your account page," which was
  actually a dead end, since that form needs an email/password this flow
  never gives them). Practical impact: anyone who knows a phone number
  with an account — not just its actual owner — can both create *and sign
  into* an account under that number. Low severity today because nothing
  else security-sensitive is gated on phone ownership (no SMS-based
  recovery flow exists to abuse), but flag this before adding one, and
  don't let it quietly become the identifier for anything higher-stakes
  without adding real verification first. The same mechanism (as
  `lib/services/auth.ts#linkOrCreateAccountByMobile`, a standalone
  function, not a shared call site) now also runs from a second entry
  point — a guest submitting "Request to Order" (§14/§16 in
  `ARCHITECTURE.md`) — since that form already collects a phone number.
  Same tradeoff, same severity reasoning; noted here so this doesn't read
  as a second, separate risk when it's really the same one from a second
  door.

## 2. Authorization

Two independent layers, both required — this is the strongest part of the
codebase:

1. **`proxy.ts`** blocks any unauthenticated or non-admin request to
   `/admin/*` (except `/admin/login`) before the route even renders — a
   single `profiles.role` lookup per admin request, deliberately accepted as
   the one exception to "keep the proxy cheap" since `/admin` is a small,
   non-prefetched area.
2. **`requireAdmin()`** (`lib/auth/dal.ts`) is called as the first line of
   **every** admin Server Action — verified present in
   `banners/actions.ts`, `collections/actions.ts`, `products/actions.ts`,
   `settings/actions.ts`, `shipping/actions.ts`, `coupons/actions.ts`. This
   matters because Server Actions are reachable by a direct POST to their
   generated endpoint, not only through the gated UI — layer 1 alone would
   not stop that.

**Privilege escalation is blocked at the database layer, not just the app
layer**: `profiles.role` has its own Postgres trigger
(`guard_profile_role_change`, `supabase/migrations/`) rejecting any change to
that column unless the caller is the service-role client. Even a compromised
or buggy client-side `update` against `profiles` cannot self-promote to
admin — this holds even if every app-layer check above were somehow
bypassed.

**RLS as the default-deny floor** (`supabase/migrations/0003_rls.sql`,
`0004_lockdown_internal.sql`): public `SELECT` only on `is_active = true`
rows of `products`/`collections`/their children; every customer-owned table
(`addresses`, `carts`, `cart_items`, `wishlist_items`, `orders`,
`order_items`) restricted to `auth.uid() = user_id` (or joined through
`cart_id`/`order_id`); **no admin-role write policies exist anywhere** —
every admin/order-creation write instead goes through the service-role
client (`lib/supabase/admin.ts`) from code that has already verified the
caller server-side. `schema_migrations` and the newer admin-only tables
(`shipping_zones`, `coupons`, `tax_settings`, `homepage_campaign`,
`homepage_gallery_images`) have RLS enabled with **zero policies**, which is
default-deny via PostgREST — reachable only by the service-role client or a
direct Postgres connection.

This "one enforcement mechanism, not two that could drift apart" design
(narrower than RLS-for-both-customers-and-admins) is a deliberate, sound
tradeoff — verified consistent everywhere it was checked.

**Order access control avoids information disclosure**:
`app/(site)/account/orders/[id]/page.tsx` uses the cookie-bound (RLS'd)
client, not the admin client, and returns `notFound()` for both "this order
doesn't exist" and "this order isn't yours" — an attacker enumerating order
ids cannot distinguish the two cases. This is exactly the right shape for
avoiding an IDOR-via-error-message leak.

**`server-only` as a build-time secret leak guard**: `lib/supabase/admin.ts`
and `lib/cloudinary/admin.ts` both import the `server-only` package, so any
accidental import from a client component fails the *build*, not just a
runtime check — a class of "service-role key ends up in the browser bundle"
bug is caught before it ships. (Interacts with a real gotcha — importing
even an unrelated export from a `server-only`-tainted file taints the whole
importing file too; see `FRONTEND.md` §9.)

## 3. Payment security (Razorpay)

- **Client-reported payment success is never trusted directly.**
  `verifyRazorpayPaymentAction` (`app/(site)/checkout/actions.ts`) first
  calls `verifyRazorpaySignature` (`lib/payments/razorpay.ts`) — an
  HMAC-SHA256 of `"<order_id>|<payment_id>"` keyed by the Razorpay secret,
  compared with `crypto.timingSafeEqual` (constant-time, avoiding a timing
  side-channel on the comparison itself) rather than `===`. Only Razorpay
  and this server know the key secret, so a forged success callback cannot
  produce a valid signature.
- Additionally cross-checks the verified `razorpay_order_id` against the
  order row's own stored `razorpay_order_id` before marking anything paid
  (`order.razorpay_order_id !== input.razorpayOrderId` rejects a
  signature that's valid for a *different* order).
- **Every price is recomputed server-side, authoritatively, from the live
  catalog** (`createOrderAction`) — the client-supplied cart lines' `price`/
  `compareAtPrice` fields are never read; subtotal, shipping, tax, and
  discount are all derived fresh from `getProductsForPricing`,
  `getShippingEstimate`, `getActiveTaxRate`, and `validateCoupon`
  respectively. A tampered client request can change *what* is in the cart,
  never *what it costs*.
- **Coupons are re-validated at order-creation time**, not just trusted from
  the earlier "Apply" preview (`applyCouponAction` is explicitly documented
  as preview-only; `createOrderAction` calls `validateCoupon` again from
  scratch) — closes the gap where a coupon could expire, hit its usage
  limit, or stop applying to the cart's current subtotal between preview and
  purchase.
- **Fixed — Razorpay webhook reconciliation** (`app/api/webhooks/razorpay/
  route.ts`, `lib/payments/razorpay.ts#verifyRazorpayWebhookSignature`, see
  `ARCHITECTURE.md` §22). Was: the only way an order's `payment_status`
  became `paid` was the browser successfully calling
  `verifyRazorpayPaymentAction` after Checkout's `handler` fired — a tab
  close, dropped network, or JS error between capture and that call left
  the order `pending` forever even though Razorpay had the money. Now: a
  Route Handler verifies `x-razorpay-signature` (HMAC-SHA256 over the raw
  body, a **separate secret** from the Checkout-callback signature scheme)
  before any DB read, looks the order up by `razorpay_order_id` (new index,
  `orders_razorpay_order_id_idx`), and calls the same `markOrderPaid` —
  idempotently, by checking `payment_status` first so a retried webhook or
  a race with the client path is a no-op. The client-side path is
  untouched; this is purely an additive second confirmation route.

## 4. Input validation & injection surface

- **No SQL injection surface found.** All application queries go through
  Supabase's PostgREST query builder (parameterized), never raw string
  concatenation with user input. The one place raw SQL runs
  (`supabase/scripts/run-migrations.ts`, via `pg`) only ever executes
  trusted local migration files, not user input.
- **No XSS sink found** — `dangerouslySetInnerHTML` does not appear anywhere
  in the codebase (`grep` across `app/`, `components/`, `lib/`). React's
  default JSX escaping is the only rendering path for user-supplied text
  (order addresses, customer-entered names, product descriptions from the
  admin).
- **Checkout server-side validates** required address fields and a 6-digit
  PIN format (`createOrderAction`), and rejects non-positive/non-integer
  quantities — this exists specifically because the client-side form
  validation that presumably also exists is not a trust boundary; the
  Server Action re-checks independently.
- **CSRF**: Next.js Server Actions carry built-in Origin-header verification
  (a framework-level protection, not something this app configures) — not
  independently re-verified as part of this audit, but no code here
  attempts to bypass or weaken it (no custom fetch-based Server Action
  invocation found).

## 5. Secrets & environment management

- `.env*` is gitignored except `.env.example` (checked — the `.gitignore`
  entry and the actual committed `.env.example` were both read; the example
  file contains only empty placeholder keys, no live credentials).
- Server-only secrets (`SUPABASE_SECRET_KEY`, `CLOUDINARY_API_SECRET`,
  `RAZORPAY_KEY_SECRET`) are only ever read inside `server-only`-guarded
  modules or Server Actions — never passed to a client component, never
  present in any `NEXT_PUBLIC_*` variable.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon key) is the only Supabase
  credential exposed to the browser, by design — it is meaningless without
  RLS, which is enabled on every table it can reach.
- `next.config.ts`'s custom Cloudinary loader is a Client Component (Next
  requires this for a custom `loaderFile`) and only ever handles the public
  `cloud_name` baked into a stored image URL — not a secret.

## 6. File upload handling

**Fixed** (`lib/cloudinary/validate-image.ts`, see `ARCHITECTURE.md` §22).
Was: every admin image-upload Server Action validated only
`file instanceof File && file.size > 0` before forwarding the raw buffer to
Cloudinary — no server-side check that the file was actually an image, and
the `accept="image/*"` HTML attribute is a client-side hint only. Now:
every one of those actions (`banners`, `collections`, `products`,
`homepage_campaign`/`homepage_gallery_images`) calls a shared validator
first — an explicit MIME allowlist, a magic-byte sniff of the actual buffer
(not the spoofable `file.type` alone), and an 8MB ceiling independent of
the global 10MB Server Action body cap. Severity was already low (every
site is behind `requireAdmin()`, §2) — this closes it rather than
mitigating it further.

## 7. Transport & response headers

**Fixed** (`next.config.ts#headers()`, see `ARCHITECTURE.md` §22). Was: no
`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, or `Strict-Transport-Security` configured anywhere. Now:
all of the above are set for every route, plus `Permissions-Policy`
denying camera/microphone/geolocation (unused by this app) and
`frame-ancestors 'self'`. The CSP was built from an audit of every actual
external resource this app loads (Supabase, Cloudinary, Razorpay Checkout,
the Meta Pixel — `connect.facebook.net` script + `www.facebook.com` `/tr/`
beacons, storefront-only, `ARCHITECTURE.md` §23 — and self-hosted fonts)
rather than a generic template. **`script-src` includes
`'unsafe-inline'`** — required by Next's own documented non-nonce CSP
pattern, since Next inlines its hydration/RSC-streaming payload as
`<script>` tags; omitting it caused a same-day regression (every
`loading.tsx`-backed route got stuck on its skeleton) caught and fixed.
**`frame-src` is wide open (`*`)** — a scoped `*.razorpay.com` value broke
every card payment at the 3D Secure/OTP step, since that iframe is hosted
on the card-issuing bank's own (unenumerable) domain, never Razorpay's;
`frame-src *` for this exact reason is standard practice for a merchant
CSP in front of a card gateway. `frame-ancestors` is the separate,
still-fully-enforced protection against this site itself being framed —
unaffected. See `ARCHITECTURE.md` §22 for both incidents' full writeups.

## 8. Rate limiting

**Fixed** (`lib/rate-limit.ts`, see `ARCHITECTURE.md` §22). Was: no rate
limiting at the application level for `signIn`/`signUp`,
`createOrderAction`/`applyCouponAction`, or any other Server Action — most
notably, `applyCouponAction` returned a clear valid/invalid signal per
attempt with no throttling, a plausible brute-force target. Now: a
Postgres-backed fixed-window limiter (no new external dependency — chosen
specifically because this app has no long-lived process to hold an
in-memory counter safely across serverless instances) guards `signIn`
(by IP and by IP+email composite), `signUp`, `applyCouponAction`, and
`createOrderAction`. Fails open on its own DB errors, so infrastructure
trouble never turns into a checkout/sign-in outage.

## 9. Dependencies

`npm audit` (run against the committed `package-lock.json` at time of
writing): **0 vulnerabilities** across all severity levels (info through
critical). Re-run this periodically — it's a point-in-time result, not a
standing guarantee.

## What's already strong — don't regress these

- Two-layer admin gating (proxy + per-action `requireAdmin()`).
- `getUser()` over `getSession()` for every auth check.
- Database-level trigger blocking `profiles.role` self-escalation.
- Authoritative server-side price/coupon/tax recomputation on every order —
  never trust a client-supplied total.
- Constant-time HMAC comparison for payment signature verification.
- `notFound()` (not a distinguishable "forbidden" vs "missing") on
  cross-account resource access.
- `server-only` guards making a service-role-key leak a build failure, not a
  runtime surprise.
- Idempotent webhook reconciliation (checks current state before writing,
  never assumes a webhook fires exactly once) and a rate limiter that fails
  open rather than risking a legitimate-user outage on its own errors.
