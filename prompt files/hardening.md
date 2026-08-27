# JUNEFOURTEEN — PRODUCTION HARDENING, PERFORMANCE & SMOOTHNESS PASS

You are working on an existing JUNEFOURTEEN production-ready ecommerce codebase.

IMPORTANT: The UI/UX and current database architecture are FINAL.

Your job is NOT to redesign, rebuild, simplify, replace, or visually modify the application.

Your job is to audit and improve the existing implementation for:

1. Production reliability
2. Backend security hardening
3. Runtime performance
4. Perceived speed
5. Navigation responsiveness
6. Sign-in and authentication responsiveness
7. Server Action responsiveness
8. Database query efficiency
9. Client bundle efficiency
10. Rendering efficiency
11. Image and asset efficiency
12. Error handling and resilience
13. Payment reliability
14. Overall smoothness

SEO IS EXPLICITLY OUT OF SCOPE FOR THIS TASK.

DO NOT add or modify:
- sitemap.ts
- robots.ts
- SEO architecture
- metadata strategy
- OpenGraph strategy

We will handle SEO separately later.

==================================================
ABSOLUTE NON-NEGOTIABLE CONSTRAINTS
==================================================

DO NOT CHANGE, REMOVE, REPLACE, OR REDESIGN ANY UI/UX.

The following are LOCKED:

- All visual designs
- Layouts
- Page structures
- Typography
- Fonts
- Colors
- Spacing
- Border radii
- Product card designs
- Homepage composition
- Header
- Navigation
- Mobile navigation
- Cart UI
- Checkout UI
- Account UI
- Admin UI
- Filters
- Bottom sheets
- Product grids
- Hero design
- Animation design
- Responsive layouts
- Existing interaction design

DO NOT:
- redesign components
- replace the design system
- introduce a new component library
- change Tailwind design tokens
- change typography
- change breakpoints
- change product grid behavior
- change the locked 2-column mobile/tablet product grid
- introduce horizontal product carousels
- replace existing localStorage state architecture
- introduce Redux, Zustand, or another global state library
- change the CMS information architecture
- remove existing functionality
- reduce existing functionality
- change routes
- change URLs
- change the existing database schema
- drop tables
- rename tables
- rename columns
- modify existing relationships
- perform destructive migrations

THE CURRENT DATABASE STRUCTURE IS ALSO LOCKED.

You may optimize:
- queries
- indexes ONLY if they can be safely added without changing existing schema behavior
- caching
- query selection
- batching
- connection usage
- service/repository implementation
- request flow

But do NOT alter existing data structures or business semantics.

Before making any UI-related change, ask:

"Does this change alter what the user sees or how the finalized UI behaves?"

If yes, DO NOT make that change.

Optimization must be invisible from a design perspective.

==================================================
FIRST: AUDIT THE CURRENT IMPLEMENTATION
==================================================

Before changing code, inspect the actual codebase and verify every finding.

Do not blindly apply generic optimizations.

Audit:

- package.json
- next.config.ts
- proxy.ts
- app/
- components/
- lib/
- hooks/
- providers/
- Supabase integration
- authentication flow
- Server Actions
- payment flow
- Cloudinary integration
- caching strategy
- repository queries
- service layer
- client component boundaries
- Suspense boundaries
- loading states
- bundle-heavy dependencies
- dynamic imports
- admin routes
- account routes
- checkout
- sign-in/sign-up
- navigation behavior

Also inspect:

- ARCHITECTURE.md
- FRONTEND.md
- OPTIMIZATION.md
- SECURITY.md
- ADMIN_CMS_AUDIT.md

Treat the current architecture and frontend conventions as authoritative unless there is a concrete bug or production reliability issue.

Do not guess.

Verify findings against the actual implementation.

==================================================
PRIMARY PROBLEM TO INVESTIGATE: PERCEIVED SLOWNESS
==================================================

The current site sometimes feels slower than expected.

Examples:

- Clicking "Sign In" can take a few seconds.
- Certain navigation actions feel delayed.
- Some interactions appear to wait before anything visually happens.
- Some Server Action-driven interactions may feel sluggish.
- The user should receive immediate feedback where appropriate.

Investigate the ACTUAL cause before changing anything.

Specifically trace:

1. What happens from the moment the user clicks Sign In.
2. Whether the destination page is prefetched.
3. Whether the click waits for:
   - Supabase session verification
   - database profile lookup
   - server rendering
   - route loading
   - client JavaScript hydration
   - middleware/proxy execution
   - unnecessary data fetching
4. Whether account/admin auth checks are duplicated unnecessarily.
5. Whether redirects cause multiple sequential round trips.
6. Whether server components are waiting on unrelated sequential requests.
7. Whether loading UI is absent, making a legitimate wait feel frozen.
8. Whether a client component is unnecessarily blocking rendering.
9. Whether navigation is being delayed by expensive JavaScript.
10. Whether fonts/images/scripts affect interaction responsiveness.

Do not "optimize" by weakening authentication or authorization.

The goal is:

FAST PERCEIVED NAVIGATION
+
FAST ACTUAL RESPONSE
+
NO SECURITY REGRESSION

If authentication or authorization requires a network/database round trip, preserve the security model but optimize everything around it.

==================================================
NAVIGATION & PERCEIVED PERFORMANCE
==================================================

Audit all major navigation flows:

- Homepage → Shop
- Homepage → Product
- Product → Cart
- Cart → Checkout
- Header → Sign In
- Sign In → Account
- Account → Orders
- Admin navigation
- Collection navigation
- Search
- Wishlist
- Mobile navigation

Identify routes that would benefit from:

- Link prefetching
- Route-level loading.tsx
- Suspense boundaries
- Streaming
- Parallel fetching
- Better Server Component boundaries
- Client-side transition feedback
- Immediate existing loading indicators without changing visual design
- next/dynamic for genuinely heavy, non-critical code

IMPORTANT:

Do not add fake delays.

Do not add unnecessary skeletons.

Do not add spinners everywhere.

Do not change existing visual UI.

Use existing design patterns and components when adding loading feedback.

The goal is that a user click should immediately feel acknowledged, while the actual page/data loads efficiently.

==================================================
AUTHENTICATION PERFORMANCE
==================================================

Audit the complete authentication flow carefully.

The current security model must remain intact:

- Continue using verified server-side authentication.
- Do not replace getUser() verification with an unsafe cached session assumption.
- Do not weaken requireAdmin().
- Do not remove the two-layer admin protection.
- Do not expose service-role credentials.
- Do not bypass RLS.

Investigate whether authentication latency comes from:

- unnecessary duplicate getUser() calls
- duplicate profile/role queries
- sequential auth/database checks
- redirect chains
- repeated server requests
- unnecessary session reads
- proxy work that can safely be minimized
- server components requesting data before it is needed

Optimize safely.

Potential improvements are acceptable only when verified appropriate, such as:

- request-scoped memoization
- deduplicating repeated reads within one request
- parallelizing independent operations
- narrowing database queries
- avoiding repeated role lookups in the same request
- avoiding unnecessary auth checks on routes where they are not required

Do NOT trade security for speed.

==================================================
SERVER ACTION PERFORMANCE
==================================================

Audit all important Server Actions, especially:

- authentication actions
- product/cart-related actions
- checkout actions
- coupon validation
- payment verification
- admin CRUD actions
- image upload actions

Check for:

- unnecessary sequential awaits
- repeated database reads
- duplicate auth verification
- over-fetching
- unnecessary revalidation
- blocking work that can be deferred safely
- poor error handling causing retries or perceived hangs

Optimize by:

- parallelizing independent work with Promise.all
- fetching only required columns
- avoiding duplicate queries
- preserving authoritative server-side pricing
- preserving coupon revalidation
- preserving admin authorization

Do not cache data that must remain live, especially:

- coupon validation
- payment state
- authentication-sensitive data
- order ownership checks
- anything where stale data creates correctness or security problems

==================================================
CACHING & DATA FETCHING
==================================================

Preserve the existing tag-based caching architecture.

Do not remove:

- unstable_cache usage where currently appropriate
- existing cache tags
- matching revalidateTag invalidation

Audit for opportunities to improve:

- request deduplication
- duplicate service calls
- repeated queries inside one request
- sequential fetches
- over-fetching
- missing safe cache boundaries

Maintain the existing rule:

Pages should perform independent fetches in parallel.

Use Promise.all where appropriate.

Do not introduce stale data into:

- checkout
- coupons
- authentication
- payment verification
- user-owned account data

==================================================
DATABASE QUERY OPTIMIZATION
==================================================

Without changing the existing database schema or behavior:

Audit repositories and services for:

- select("*") where narrower selects are appropriate
- duplicate queries
- N+1 queries
- sequential queries that can be batched
- unnecessary joins
- repeated product lookups
- repeated profile lookups
- inefficient list queries

Optimize only when measurable or clearly justified.

If indexes are genuinely needed for an existing query pattern:

- verify the query first
- verify the existing index situation
- add only safe, additive indexes
- do not change table structure
- document why the index is necessary

Do not add speculative indexes everywhere.

==================================================
REACT / RENDERING PERFORMANCE
==================================================

Audit:

- unnecessary client components
- client components importing unnecessary code
- unnecessary re-renders
- large component trees
- expensive render calculations
- unstable props
- unnecessary effects
- hydration cost

The project already follows React Compiler-compatible lint rules.

Evaluate enabling the React Compiler in the correct way for the current Next.js version.

Before enabling:

1. Verify exact installed Next.js and React versions.
2. Verify the correct configuration for those versions.
3. Verify whether additional dependencies are required.
4. Run lint/build/type checks.
5. Check for compiler diagnostics.
6. Do not enable it blindly if it creates correctness issues.

If it is safe, enable it and validate the full application.

Do not manually add excessive useMemo/useCallback/React.memo everywhere.

Prefer architectural improvements and let the compiler do its intended work where applicable.

==================================================
BUNDLE & CODE SPLITTING
==================================================

Inspect the actual bundle/dependency usage.

Do not add dynamic imports just because they sound like an optimization.

Identify genuinely heavy code that is:

- below the fold
- admin-only
- rarely used
- interaction-triggered
- not required for initial render

Potential candidates may include existing motion-heavy sections or upload-related UI, but verify actual import boundaries before changing them.

If using next/dynamic:

- preserve SSR where needed
- do not create layout shifts
- do not change visual behavior
- do not delay critical UI
- do not dynamically load code that is required immediately

==================================================
IMAGE & ASSET PERFORMANCE
==================================================

Preserve the existing Cloudinary pipeline.

Do not replace:

- the custom Cloudinary loader
- Cloudinary transformations
- current image architecture

Verify:

- no accidental double optimization
- correct responsive image sizing
- correct Next Image sizes attributes
- no oversized image downloads
- no unnecessary priority loading
- no below-the-fold images incorrectly marked priority
- no critical images delayed unnecessarily

Preserve visual image quality.

Do not reduce image quality in a way visible to users.

==================================================
PAYMENT PRODUCTION RELIABILITY
==================================================

Implement the most important production reliability improvement:

RAZORPAY WEBHOOK RECONCILIATION.

Current checkout verification must remain intact.

Do NOT remove the existing client-side verification flow.

Instead, add a second authoritative payment-confirmation path.

Requirements:

1. Create a secure Razorpay webhook endpoint.
2. Verify the webhook signature using the correct webhook secret.
3. Preserve raw request-body verification requirements.
4. Handle relevant successful payment/order events.
5. Locate the correct internal order safely.
6. Verify external Razorpay identifiers match the internal order.
7. Make processing idempotent.
8. Prevent duplicate updates.
9. Do not mark an order paid based on unverified data.
10. Keep the existing browser-side payment verification as an immediate UX path.
11. Allow the webhook to reconcile cases where:
    - the customer closes the browser
    - the callback fails
    - the network disconnects
    - JavaScript errors after payment capture

Use the existing order/payment architecture.

DO NOT redesign the checkout.

DO NOT change checkout UI.

DO NOT change payment UX.

==================================================
SECURITY HARDENING
==================================================

Add production security hardening without changing the UI or database design.

Implement appropriate security response headers where compatible with the current application, including consideration for:

- Content-Security-Policy
- X-Frame-Options or equivalent frame-ancestors strategy
- X-Content-Type-Options
- Referrer-Policy
- Strict-Transport-Security where appropriate
- Permissions-Policy where appropriate

IMPORTANT:

Do not deploy an overly strict CSP blindly.

Audit all required resources first, including:

- Next.js
- Supabase
- Razorpay
- Cloudinary
- external scripts
- fonts
- images
- development vs production behavior

Create a CSP that does not break checkout, authentication, images, scripts, or the existing UI.

Validate the application after implementation.

==================================================
FILE UPLOAD HARDENING
==================================================

Harden existing admin image uploads.

Do not change the upload UI.

Do not change the upload flow.

Add server-side validation before uploading.

At minimum validate:

- file exists
- file size is valid
- MIME type is an allowed image type

Where practical, validate actual file content/signature rather than relying exclusively on client-provided metadata.

Do not reject legitimate current image workflows unnecessarily.

Preserve existing Cloudinary behavior.

==================================================
RATE LIMITING
==================================================

Add application-level rate limiting only where it provides meaningful protection.

Prioritize:

- sign-in
- sign-up
- coupon validation
- order creation
- other abuse-sensitive public Server Actions if justified

Before choosing an implementation:

- inspect existing infrastructure and deployment assumptions
- avoid adding a heavyweight dependency without need
- prefer production-compatible distributed/serverless-safe rate limiting
- do not rely on in-memory rate limiting if it will be ineffective in the production deployment model

Rate limiting must:

- fail safely
- not create unnecessary user friction
- not slow normal users
- not weaken existing auth or payment logic

==================================================
ERROR HANDLING & RESILIENCE
==================================================

Audit production failure behavior.

Check:

- Server Action errors
- Supabase failures
- payment failures
- Cloudinary failures
- network interruptions
- invalid user input
- unexpected database errors

Improve:

- safe error handling
- logging where appropriate
- user-safe error messages
- graceful recovery

Do not expose:

- secrets
- internal stack traces
- database internals
- sensitive payment information

Use the existing toast/error UI patterns.

Do not redesign error messages or visual states.

==================================================
LOADING / SUSPENSE / STREAMING
==================================================

The goal is to make the application FEEL immediate.

Audit whether slow pages currently appear frozen because they wait for the entire route before rendering.

Where appropriate:

- split independent server data behind Suspense
- use streaming for non-critical page sections
- add route-level loading boundaries where useful
- preserve layout stability
- preserve the existing visual design

Do NOT add loading boundaries everywhere.

Do NOT make the UI flash unnecessarily.

Prioritize routes where users are currently noticing latency, especially:

- Sign In
- Account
- Shop
- Product navigation
- Checkout
- Admin pages

==================================================
PRODUCTION VALIDATION
==================================================

After implementation, run and fix all relevant issues:

1. Type checking
2. ESLint
3. Production build
4. Existing tests if available
5. Build output inspection
6. Critical route smoke tests

Verify at minimum:

PUBLIC:
- /
- /shop
- /product/[slug]
- /collections/[slug]
- /cart
- /checkout
- /sign-in or current auth route
- account routes

ADMIN:
- /admin/login
- protected admin routes
- product CRUD
- collection CRUD
- banner/content management
- image upload

PAYMENT:
- order creation
- Razorpay client verification
- duplicate verification handling
- webhook signature verification
- duplicate webhook handling
- failed webhook handling

==================================================
MEASUREMENT REQUIREMENT
==================================================

Do not make vague claims such as:

"site is now faster"

Instead, where practical, measure or compare:

- production build output
- route behavior
- duplicate requests removed
- sequential operations parallelized
- query count reduced
- unnecessary client bundle code deferred
- auth requests deduplicated
- image payload improvements
- interaction latency improvements

If exact timing measurements are unavailable, state exactly what was structurally improved and why it should improve latency.

Do not fabricate benchmark numbers.

==================================================
FINAL SAFETY CHECK
==================================================

Before completing the work, verify all of the following:

UI/UX:
- No visual redesign occurred.
- No existing layout changed.
- No typography changed.
- No spacing changed.
- No color changed.
- No component behavior was unintentionally changed.
- Locked responsive rules remain intact.
- Product grids remain exactly as designed.
- No horizontal product rails were introduced.

DATABASE:
- No existing tables were removed.
- No columns were removed or renamed.
- No existing relationships were changed.
- No destructive migration occurred.
- Existing business logic remains intact.

SECURITY:
- Admin protection remains two-layer.
- Server Actions still enforce authorization.
- getUser() verification remains intact where required.
- RLS protections remain intact.
- Server-side price calculation remains authoritative.
- Coupon revalidation remains live and uncached.
- Payment signatures are still verified securely.
- Secrets remain server-only.

PERFORMANCE:
- Existing caching architecture remains intact.
- Cache invalidation remains correct.
- No unsafe caching was introduced.
- No critical UI was unnecessarily deferred.
- No visible UI regression was introduced.
- Improvements were based on actual code analysis.

==================================================
FINAL DELIVERABLE
==================================================

Do NOT give me a vague summary.

After completing the implementation, provide a structured report with:

1. Files changed
2. Exact performance problems found
3. Root cause of the Sign In/navigation delay
4. Exact optimizations implemented
5. Security hardening implemented
6. Razorpay webhook implementation details
7. Rate limiting implementation
8. Database/query optimizations
9. React Compiler decision and validation result
10. Build/lint/type-check results
11. Any issues intentionally NOT changed and why
12. Confirmation that:
   - UI/UX was not changed
   - existing database structure was not changed
   - SEO was not touched
   - existing security architecture was not weakened

IMPORTANT FINAL INSTRUCTION:

Preserve the existing JUNEFOURTEEN application exactly as a product.

This is a production hardening and performance optimization pass.

The correct outcome is:

THE SAME WEBSITE
+
THE SAME UI/UX
+
THE SAME DATABASE STRUCTURE
+
THE SAME FEATURES
+
FASTER
+
SMOOTHER
+
MORE RESPONSIVE
+
MORE SECURE
+
MORE RELIABLE IN PRODUCTION

Do not redesign anything.
Do not simplify anything.
Do not remove anything.
Do not change the user's visual experience.

Audit first.
Verify every assumption.
Then make only justified, production-safe improvements.