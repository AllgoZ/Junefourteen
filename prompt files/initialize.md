You are a senior product designer + senior Next.js frontend engineer.

We are building a premium women's fashion e-commerce website for a clothing brand.

IMPORTANT:
The attached reference screenshots are from a competitor website.
"prompt files\reference images"
USE THE SCREENSHOTS ONLY TO UNDERSTAND FUNCTIONAL REQUIREMENTS.

DO NOT COPY:
- Their design
- Their layout
- Their color palette
- Their typography
- Their spacing
- Their navigation structure
- Their cards
- Their visual hierarchy
- Their UI components
- Their page composition
- Their animations
- Their branding
- Their imagery
- Their exact UX patterns

The final website must feel like an original premium fashion brand website.

==================================================
PROJECT DIRECTION
==================================================

Brand type:
Premium women's clothing / ethnic contemporary fashion.

Design direction:

- Black & white dominant visual system
- Premium
- Minimal
- Editorial
- Sophisticated
- Modern
- iOS-inspired
- Extremely clean
- Spacious
- Elegant
- Fast
- Mobile-first
- Easy to navigate
- High-end fashion e-commerce feel

Think:

"Apple-level simplicity + premium fashion editorial"

NOT:

"Generic Shopify clothing template"

The UI should feel intentionally designed rather than assembled from standard e-commerce components.

==================================================
TECH STACK
==================================================

Use:

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui where useful
- Lucide icons
- React
- Modern CSS
- Responsive design

Use the latest stable versions available in the existing project.

Do NOT introduce unnecessary libraries.

Prefer native browser APIs and lightweight solutions.

Use proper component architecture.

==================================================
CURRENT DEVELOPMENT PHASE
==================================================

IMPORTANT:

RIGHT NOW WE ARE ONLY BUILDING THE FRONTEND/UI.

DO NOT IMPLEMENT:

- Supabase
- Database
- Authentication backend
- Payment gateway
- Real shipping API
- Admin panel
- Real order management
- Real inventory backend
- Backend APIs

Instead, create a clean frontend architecture that can later connect to:

- Supabase
- Supabase Auth
- Supabase Storage
- Payment gateway
- Shipping API
- Admin dashboard

The frontend must be designed so replacing mock data with Supabase later is straightforward.

Use local mock data and localStorage where necessary for the current prototype.

==================================================
DESIGN PRINCIPLES
==================================================

The website should follow these principles:

1. Black and white first.

Primary colors:
- Black
- White
- Off-white
- Very subtle gray

Avoid colorful UI.

Product photography can naturally provide color.

2. Typography

Use a premium modern typography system.

Prefer:
- clean sans-serif for UI
- optional elegant serif/editorial font for selected headings

Do not overuse serif fonts.

Typography must have strong hierarchy.

3. Borders

Use very subtle borders.

Avoid excessive cards with heavy borders.

4. Shadows

Use extremely subtle shadows.

Avoid traditional large e-commerce drop shadows.

5. Radius

Use tasteful rounded corners inspired by modern Apple UI.

Do not make everything excessively rounded.

6. Spacing

Generous whitespace.

The website should breathe.

7. Icons

Use Lucide icons.

Do NOT use emojis as UI icons.

8. Buttons

Minimal black/white buttons.

Primary:
Black background + white text.

Secondary:
White background + black border/text.

9. Animations

Use subtle motion.

Examples:
- image fade
- product image hover transition
- drawer slide
- modal scale/fade
- button feedback
- page transitions

Animations must be fast and subtle.

Avoid flashy animations.

==================================================
RESPONSIVE REQUIREMENT
==================================================

This is extremely important.

The website must be designed separately for:

Mobile:
320px+
375px
390px
430px

Tablet:
768px+

Laptop:
1024px+

Desktop:
1280px+
1440px+

Do NOT simply shrink the desktop layout.

Mobile must have its own thoughtful UX.

Touch targets should be comfortable.

Avoid tiny controls.

==================================================
GLOBAL NAVIGATION
==================================================

Create a premium minimal navigation.

Desktop:

Left:
- Shop
- Collections
- New Arrivals

Center:
- Brand logo/name

Right:
- Search
- Account
- Wishlist
- Cart

Mobile:

Top navigation should be compact.

Use:
- Menu
- Brand logo/name
- Search
- Cart

Use a mobile bottom navigation only if it genuinely improves usability.

Do not overcrowd the mobile header.

Header should become sticky intelligently.

On scroll:

- subtle background change
- subtle border
- slight blur/transparency if appropriate

Use an iOS-style glass effect carefully.

Do NOT make the entire site glassmorphism.

==================================================
HOME PAGE
==================================================

Create a premium fashion homepage.

Sections:

1. Hero

Large editorial fashion image.

Minimal text.

Example:

NEW COLLECTION

"Quietly Bold"

Short supporting line.

CTA:
SHOP COLLECTION

Hero should feel like a fashion campaign, not a conventional e-commerce banner.

Desktop:
Large cinematic hero.

Mobile:
Optimized vertical image composition.

2. Featured Collections

Examples:

- Everyday Edit
- Handloom Stories
- Festive Edit
- Contemporary Classics

Use large editorial image tiles.

Avoid generic card-grid appearance.

3. New Arrivals

Horizontal product rail on desktop/mobile.

Include:

- Product image
- Product name
- Price
- Optional "New" label
- Wishlist button

4. Editorial section

Large image + text.

Example:

"Made for the way you move."

Explain brand philosophy.

5. Best Sellers

Product grid.

6. Brand story

Minimal editorial section.

7. Instagram / social section

Visual grid.

8. Newsletter

Minimal newsletter signup.

9. Footer

Include:

SHOP
- New Arrivals
- All Products
- Collections
- Best Sellers

HELP
- Contact
- Shipping
- Returns
- Size Guide
- FAQs

COMPANY
- About
- Our Story
- Journal

LEGAL
- Privacy
- Terms
- Refund Policy

Social links.

==================================================
SHOP / COLLECTION PAGE
==================================================

Create a premium product discovery experience.

Desktop:

- Breadcrumb
- Collection title
- Collection description
- Product count
- Filter
- Sort
- Product grid

Mobile:

Do NOT create a complicated sidebar.

Use a bottom-sheet style filter/sort interface inspired by iOS.

Example:

FILTER
SORT BY

Filter categories:

- Category
- Size
- Sleeve Length
- Color
- Price
- Availability
- Collection

Sort:

- Featured
- Newest
- Price: Low to High
- Price: High to Low
- Best Selling

Product cards should be clean.

Example:

IMAGE

Wishlist icon

Product name

₹3,099

Optional:
"Sold Out"

Do not overload cards with information.

==================================================
PRODUCT CARD
==================================================

Create reusable ProductCard component.

Requirements:

- Large image
- Proper image aspect ratio
- Hover image swap on desktop
- Touch-friendly mobile interaction
- Wishlist button
- Product name
- Price
- Sale price if applicable
- "New" badge
- "Sold Out" state

Sold out should be visually elegant.

Do NOT use giant red circles like the reference website.

Instead use a subtle label such as:

SOLD OUT

or

UNAVAILABLE

Use grayscale styling.

==================================================
PRODUCT DETAIL PAGE
==================================================

This is one of the most important pages.

Create a premium product detail experience.

Desktop:

Left:
Large image gallery.

Right:
Sticky product information panel.

Mobile:

Images first.

Product information below.

Product information:

- Product name
- Price
- Optional sale price
- Short description
- Product availability
- Variant selectors
- Size selector
- Sleeve selector
- Custom sizing
- Quantity
- Add to Bag
- Buy Now
- Wishlist

==================================================
PRODUCT IMAGE GALLERY
==================================================

Desktop:

Large primary image.

Small thumbnails.

Allow:

- thumbnail selection
- previous/next
- zoom
- fullscreen/lightbox

Mobile:

Use swipeable image gallery.

Show image counter:

1 / 6

Do not make the gallery visually complicated.

Product photography should dominate.

==================================================
SIZE SELECTION
==================================================

Support standard sizes:

XS
S
M
L
XL
XXL

Make these pill/button selectors.

Selected state:

Black background
White text

Unselected:

White/off-white
Black text
Subtle border

Include:

"Size Guide"

Clicking it opens a modal / sheet.

==================================================
SLEEVE LENGTH
==================================================

Some products may support sleeve options.

Example:

Sleeveless
3/4 Sleeve
Full Sleeve
18" Sleeve

Not every product should require this option.

Only display options when the product supports them.

Architecture should support optional variants.

==================================================
CUSTOM SIZE
==================================================

This functionality is important.

Allow:

Standard Size

or

Custom Size

If Custom Size is selected, display a clean measurement form.

Include:

UNIT

CM / INCH

TOP

- Bust
- Upper Chest
- Middle Chest
- Shoulder
- Sleeve Length
- Front Neck
- Back Neck
- Top Length
- Arm Round

BOTTOM

- Waist
- Hip
- Pant Length

Do not blindly reproduce every field from the reference.

Create a sensible professional tailoring measurement system.

Make fields:

- clearly labeled
- easy to understand
- mobile-friendly
- keyboard optimized
- numeric input

Add:

"How to measure?"

This opens a visual/help modal.

For now use placeholder instructional illustrations or placeholder images.

Do NOT connect backend.

Store selected measurements temporarily in local state/localStorage.

==================================================
SIZE GUIDE
==================================================

Create a premium modal.

Include:

Standard size chart.

Columns:

Size
Bust
Waist
Hip
Shoulder

Provide CM / IN toggle.

Also include:

"How to measure yourself"

with simple explanations.

==================================================
PRODUCT INFORMATION ACCORDION
==================================================

Use elegant accordions.

Sections:

Description
Fabric & Details
Size & Fit
Wash Care
Shipping & Returns

Keep the default page clean.

Do not display huge walls of text.

==================================================
ADD TO BAG
==================================================

Primary CTA:

ADD TO BAG

Secondary:

BUY NOW

Buttons should be large and mobile friendly.

Before adding to bag, validate:

- Required size
- Required variant
- Custom measurements if custom size is selected

Show elegant inline validation.

==================================================
CART
==================================================

Create a modern cart drawer.

Desktop:

Slide-in drawer from right.

Mobile:

Full-screen cart sheet/page.

Cart item:

Product image
Product name
Variant
Size
Custom Size indicator
Price
Quantity controls
Remove

Show:

Subtotal

Estimated shipping

Total

CTA:

CHECKOUT

Do NOT implement payment.

Checkout button can currently lead to a placeholder checkout page.

==================================================
SHIPPING ESTIMATOR
==================================================

The reference website has a shipping estimation feature.

Implement this functionality in the frontend.

Create:

"Estimate Shipping"

Fields:

Country
State
PIN / ZIP

Example:

India
Tamil Nadu
641045

For prototype:

Use mock shipping rules.

Example:

Tamil Nadu → ₹100
Other India → ₹120
Remote area → ₹150

Clearly structure this so later it can be replaced with a real shipping API.

Do not hard-code the logic inside UI components.

Create a separate shipping utility/service.

==================================================
WISHLIST
==================================================

Implement frontend wishlist functionality using localStorage.

Users should be able to:

- add/remove wishlist
- view wishlist
- move item to bag

No backend required yet.

==================================================
SEARCH
==================================================

Create a premium search experience.

Desktop:
Search overlay.

Mobile:
Full-screen search experience.

Include:

Search input

Recent searches

Popular searches

Product results

Collection results

No backend.

Search mock product data locally.

Implement basic client-side search.

==================================================
ACCOUNT
==================================================

For now create a frontend-only account page.

Sections:

Orders
Wishlist
Saved Addresses
Profile

Since backend is not implemented:

Show an appropriate "Coming Soon" / prototype state where needed.

Do not create fake authentication.

==================================================
CHECKOUT PLACEHOLDER
==================================================

Create a polished checkout UI even though payment/backend is not implemented.

Sections:

Contact
Shipping Address
Delivery Method
Order Summary
Payment

Payment section:

"Payment integration coming soon"

Do not implement fake transactions.

Architecture should later support Razorpay/Stripe/etc.

==================================================
PRODUCT DATA ARCHITECTURE
==================================================

Create typed mock data.

Example conceptual structure:

Product:

id
slug
name
description
price
compareAtPrice
images
category
collection
tags
isNew
isBestSeller
isSoldOut
sizes
colors
sleeveOptions
supportsCustomSize
fabric
washCare
shippingInfo

Variant:

id
name
type
options

CustomMeasurements:

unit
bust
upperChest
middleChest
shoulder
sleeveLength
frontNeck
backNeck
topLength
armRound
waist
hip
pantLength

Do not put all data directly inside JSX.

Create:

/data

for mock product data.

==================================================
ROUTE STRUCTURE
==================================================

Use Next.js App Router.

Suggested structure:

/

 /shop

 /collections/[slug]

 /product/[slug]

 /search

 /wishlist

 /cart

 /checkout

 /account

 /size-guide

 /about

 /contact

 /shipping

 /returns

 /faq

Create reusable components.

Suggested:

components/
  layout/
  navigation/
  product/
  cart/
  wishlist/
  search/
  size/
  checkout/
  ui/

lib/
  mock-data
  shipping
  utils

types/

Do not rigidly follow this structure if a better architecture is appropriate.

==================================================
MOBILE UX
==================================================

Mobile experience is a priority.

Make sure:

- No horizontal overflow
- No tiny buttons
- No desktop UI squeezed onto mobile
- Bottom sheets work correctly
- Product images are optimized
- Sticky Add to Bag can be used on product pages
- Filters use mobile sheet
- Cart is easy to edit
- Checkout fields are easy to fill
- Navigation is one-handed friendly

For product detail on mobile:

Consider a sticky bottom CTA:

ADD TO BAG

with price if appropriate.

==================================================
ACCESSIBILITY
==================================================

Implement:

- semantic HTML
- keyboard navigation
- focus states
- proper labels
- aria-labels for icon buttons
- sufficient contrast
- accessible dialogs
- accessible accordions
- accessible form errors

Do not sacrifice accessibility for aesthetics.

==================================================
PERFORMANCE
==================================================

This is an e-commerce website.

Prioritize:

- Next.js Image
- lazy loading
- proper image sizing
- minimal JavaScript
- server components where appropriate
- client components only when interaction requires them
- no unnecessary dependencies
- no huge UI libraries

Images should not cause layout shift.

Use appropriate aspect ratios.

==================================================
SEO
==================================================

Even though this is currently a frontend prototype, implement the correct structure for:

- page metadata
- product metadata
- canonical-ready URLs
- semantic headings
- alt text
- OpenGraph metadata structure

Create sensible metadata using mock brand/product information.

==================================================
DESIGN SYSTEM
==================================================

Create a consistent design system.

Define:

Typography scale
Spacing
Border radius
Buttons
Inputs
Badges
Product cards
Dialogs
Sheets
Accordions
Navigation
Footer

Use CSS variables where appropriate.

Primary UI should remain:

Black
White
Off-white
Gray

Avoid introducing random colors.

Product photography is allowed to be colorful.

==================================================
IOS-INSPIRED UX
==================================================

IMPORTANT:

"IOS INSPIRED" does NOT mean copying Apple's website.

Use iOS principles such as:

- clear hierarchy
- smooth sheets
- clean typography
- tactile controls
- subtle blur
- excellent touch targets
- minimal visual noise
- progressive disclosure
- elegant transitions
- intuitive gestures
- simple navigation

Do NOT copy Apple's branding or website.

==================================================
MICROINTERACTIONS
==================================================

Add subtle interactions:

- Heart animation when favoriting
- Add-to-cart feedback
- Image hover transition
- Sheet animation
- Search overlay animation
- Button press feedback
- Toast when item added
- Quantity transition
- Wishlist transition

Keep animations around 150–300ms where appropriate.

Do not over-animate.

==================================================
EMPTY STATES
==================================================

Design polished empty states for:

Wishlist empty
Cart empty
Search no results
No products
Account not logged in

Do not simply display:

"No data"

Make the UI feel intentional.

==================================================
ERROR / LOADING STATES
==================================================

Create skeleton loaders for:

- product cards
- product detail
- collection pages

Create elegant error states.

==================================================
MOCK CONTENT
==================================================

Create at least 12 realistic women's clothing products.

Examples:

- Handloom Kurta Set
- Kalamkari Kurta
- Cotton Anarkali
- Rani Weave
- Everyday Cotton Set
- Festive Handloom Set
- Contemporary Kurta
- Printed Dupatta Set

Use fictional product names.

DO NOT COPY competitor product names, descriptions, imagery, branding, or content from the screenshots.

Use local placeholder/product images if available.

If images are not available, create a clean image placeholder system so real product photography can be added later.

==================================================
IMPORTANT FUNCTIONAL REFERENCE FROM THE SCREENSHOTS
==================================================

The screenshots demonstrate these useful e-commerce capabilities:

1. Sleeve-length options
2. Standard size selection
3. Custom size selection
4. Custom tailoring measurements
5. Size chart
6. Product gallery
7. Product descriptions
8. Wash care
9. Shipping information
10. Sold-out products
11. Cart drawer
12. Quantity adjustment
13. Shipping estimation
14. Product collections
15. Product filtering
16. Product sorting

These are functional references only.

Create your OWN UX for these features.

==================================================
DO NOT COPY THE COMPETITOR
==================================================

This requirement is extremely important.

When looking at the screenshots, ask:

"What functionality is useful?"

NOT:

"How can I recreate this website?"

The resulting UI should be visually distinguishable from the reference.

If someone places both websites side by side, they should immediately look like two completely different brands.

==================================================
FUTURE BACKEND PREPARATION
==================================================

Even though we are not implementing Supabase now, structure the frontend so later we can add:

Supabase database
Supabase Storage
Supabase Auth
Admin Panel
Product Management
Inventory
Orders
Customers
Coupons
Shipping Rules
Custom Measurements
Payment Integration

Do not tightly couple mock data to UI components.

Create service/data abstraction where useful.

For example:

getProducts()
getProductBySlug()
getCollections()
getShippingEstimate()

Initially these can use mock data.

Later they can be replaced with Supabase calls without rewriting the UI.

==================================================
ADMIN PANEL
==================================================

DO NOT BUILD THE ADMIN PANEL NOW.

Only make sure the architecture will allow it later.

Future admin will manage:

Products
Categories
Collections
Images
Variants
Sizes
Sleeves
Custom measurement fields
Inventory
Orders
Customers
Coupons
Shipping
Homepage sections

==================================================
CODE QUALITY
==================================================

Write production-quality code.

Avoid:

- massive components
- duplicated JSX
- hardcoded repeated values
- unnecessary useEffect
- unnecessary client components
- prop drilling where avoidable
- magic numbers
- inline style clutter
- inaccessible interactions

Use reusable components.

Keep components focused.

Use TypeScript properly.

No `any` unless absolutely unavoidable.

==================================================
BEFORE CODING
==================================================

First inspect the existing project.

Determine:

- current Next.js version
- current dependencies
- existing styling
- existing components
- existing assets
- current folder structure

Do NOT unnecessarily rewrite an existing working setup.

If the project is empty, establish the architecture above.

==================================================
IMPLEMENTATION PROCESS
==================================================

Work in this order:

PHASE 1:
Design system
Typography
Colors
Spacing
Buttons
Inputs
Navigation
Basic layout

PHASE 2:
Homepage

PHASE 3:
Shop / collection pages

PHASE 4:
Product detail page

PHASE 5:
Size guide + custom measurements

PHASE 6:
Cart drawer

PHASE 7:
Wishlist

PHASE 8:
Search

PHASE 9:
Checkout placeholder

PHASE 10:
Responsive refinement

PHASE 11:
Accessibility

PHASE 12:
Performance optimization

PHASE 13:
Final visual polish

==================================================
QUALITY BAR
==================================================

Do not stop when the website is technically functional.

The final result should feel like a real premium fashion brand that could launch publicly.

Evaluate:

- Is the design premium?
- Is it visually cohesive?
- Does it feel expensive?
- Is navigation obvious?
- Is mobile experience excellent?
- Are product pages easy to shop?
- Is custom sizing intuitive?
- Does the UI feel original?
- Are there unnecessary elements?
- Does anything look like a generic Shopify template?
- Does anything resemble the competitor screenshots too closely?

If yes, refine it.

==================================================
FINAL REQUIREMENT
==================================================

Build the website directly in the existing project.

After implementation:

1. Run the project.
2. Check for TypeScript errors.
3. Check for lint errors.
4. Check all routes.
5. Test desktop.
6. Test mobile.
7. Test cart interactions.
8. Test wishlist.
9. Test product variants.
10. Test custom sizing.
11. Test size guide.
12. Test shipping estimator.
13. Test search.
14. Test sold-out state.
15. Test empty states.
16. Fix any issues you find.

Do not just tell me what you would build.

Actually implement the UI.

The current objective is a polished frontend prototype.

Backend/Supabase/Admin will be implemented later.