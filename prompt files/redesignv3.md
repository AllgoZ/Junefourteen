# JUNEFOURTEEN — REDESIGN V3

# PHOTOGRAPHY-FIRST PREMIUM FASHION / EDITORIAL E-COMMERCE

You are acting as:

* Senior Product Designer
* Fashion Digital Art Director
* Senior Next.js Frontend Engineer
* Senior UX Designer
* Design Systems Engineer

You are working on an existing **JuneFourteen women's fashion e-commerce website**.

This document is the **MASTER VISUAL + UX REDESIGN SPECIFICATION** for the project.

The existing codebase may already contain useful components, functionality, data structures, routes, stores and business logic.

**Do not destroy useful existing functionality.**

However, the visual experience requires a substantial transformation.

This is **NOT a CSS polish**.

This is **NOT a small redesign**.

This is a complete transformation of the visual language, homepage composition, product presentation, navigation experience and editorial direction.

---

# 01 — THE MOST IMPORTANT REQUIREMENT

## JUNEFourteen IS A FASHION BRAND FIRST.

The website is an e-commerce website technically.

But visually and emotionally:

> **It should feel like a premium fashion editorial that happens to have a shopping layer.**

The customer should first experience:

**PHOTOGRAPHY → FASHION → DESIRE**

and then:

**PRODUCT → DETAILS → PURCHASE**

Do NOT make the website feel like:

**PRODUCT → PRICE → SALE → ADD TO CART**

The photography is the primary selling tool.

The models are important.

The garments are important.

The styling is important.

The atmosphere is important.

The interface should support those things rather than compete with them.

---

# 02 — DESIGN NORTH STAR

The final website should feel like:

**A PREMIUM DIGITAL FASHION LOOKBOOK**

combined with:

**A REFINED E-COMMERCE EXPERIENCE**

combined with:

**A CONTEMPORARY LUXURY FASHION EDITORIAL**

The desired emotional reaction is:

> "This brand has beautiful clothes and beautiful photography."

Not:

> "This is a nice e-commerce website."

The interface should be almost invisible.

The photography should remain memorable.

---

# 03 — DESIGN PRIORITY HIERARCHY

The visual hierarchy must follow this order:

1. PHOTOGRAPHY
2. MODEL / GARMENT
3. COLLECTION / PRODUCT
4. SHOPPING INFORMATION
5. INTERACTION
6. SUPPORTING TEXT

Never reverse this hierarchy.

The customer should not notice:

* badges
* buttons
* card borders
* promotional labels
* paragraphs
* decorative UI

before noticing the clothing.

---

# 04 — V3 OVERRIDES PREVIOUS HOMEPAGE DIRECTIONS

There is an existing redesign plan in the repository.

Use it as a foundation for:

* technical architecture
* product functionality
* PDP functionality
* cart
* wishlist
* search
* filters
* sorting
* state management
* responsive behavior
* performance
* accessibility

However:

**THIS V3 DOCUMENT OVERRIDES THE PREVIOUS HOMEPAGE VISUAL DIRECTION.**

If an older instruction conflicts with this document, follow **V3**.

Do not combine conflicting visual directions.

V3 is the final visual direction.

---

# 05 — CLIENT'S CORE REQUIREMENT

The client wants:

## LESS TEXT.

## MORE VISUAL.

## MORE PHOTOGRAPHY.

## MORE PREMIUM.

## MORE FASHION.

The homepage should not try to explain the brand.

The homepage should make the customer **feel the brand**.

---

# 06 — HOMEPAGE PHILOSOPHY

Do NOT build a conventional e-commerce homepage.

Avoid this structure:

```text
Hero
↓
Headline
↓
Paragraph
↓
CTA
↓
Featured Collections
↓
Product Cards
↓
Brand Philosophy
↓
Story
↓
Products
↓
CTA
```

This is generic.

Instead, think in terms of:

```text
PHOTOGRAPHY
↓
COLLECTION
↓
PHOTOGRAPHY
↓
PRODUCTS
↓
PHOTOGRAPHY
↓
BLACK EDIT
↓
PRODUCTS
↓
CAMPAIGN
↓
BEST SELLERS
```

The homepage should feel like the customer is scrolling through a fashion campaign.

---

# 07 — HERO SECTION

## THE HERO MUST BE PURELY VISUAL.

This is a hard requirement.

Remove the existing:

* "Quietly Bold"
* "Shop Collection"
* large headline
* description
* marketing copy
* promotional text

from the hero.

### Default hero:

A single exceptional fashion photograph.

Use the strongest available image assets.

The image should:

* occupy almost the entire viewport
* be edge-to-edge
* feel cinematic
* showcase the model
* showcase the garment
* preserve important composition
* have excellent image quality
* feel like a campaign photograph

### NO LARGE TEXT.

### NO MARKETING COPY.

### NO PROMOTIONAL CTA.

### NO PARAGRAPH.

Prefer **zero text** over unnecessary text.

If the UX absolutely requires an interaction affordance, use an extremely subtle indicator such as:

```text
↓
```

or a minimal navigation affordance.

But do not place a marketing message on the image.

---

# 08 — HERO IMAGE TREATMENT

Do not blindly force every image into the same crop.

Protect:

* faces
* garment silhouette
* full-body composition
* important patterns
* hands
* styling details

Use responsive art direction.

Mobile and desktop may use different crops if necessary.

The goal is:

**best photograph presentation**

not:

**rigid aspect-ratio consistency.**

---

# 09 — HEADER

The header should be minimal and premium.

## Mobile

Preferred:

```text
☰          JUNEFourteen          ⌕    BAG
```

The existing general structure is good, but refine it.

Requirements:

* thin refined icons
* excellent alignment
* generous spacing
* minimal visual weight
* no unnecessary borders
* no heavy shadow
* no oversized logo
* proper touch targets
* subtle sticky behavior

The header must not compete with the photography.

---

# 10 — DESKTOP HEADER

Desktop can use:

```text
SHOP     COLLECTIONS     NEW

              JUNEFourteen

SEARCH     WISHLIST     ACCOUNT     BAG
```

Keep navigation concise.

Do not create a giant navigation bar.

Do not create a crowded mega-menu.

Do not make navigation look like a SaaS dashboard.

The logo should remain the visual center of the header.

---

# 11 — HEADER BEHAVIOR

At the top:

Minimal.

During scroll:

Subtle sticky header.

Do not introduce:

* huge sticky bars
* thick shadows
* excessive blur
* large glass panels

The header should feel almost native to the page.

---

# 12 — HOMEPAGE SECTION SYSTEM

The homepage should use a combination of:

### A. Full-bleed photography

### B. 2-column editorial collection grids

### C. 2-column product grids

### D. Large campaign photography

### E. Dedicated BLACK EDIT section

### F. Minimal supporting UI

Do not make every section identical.

The page should have visual rhythm.

---

# 13 — FEATURED COLLECTIONS

The current horizontal carousel approach must be removed.

## DO NOT USE:

* horizontal carousel
* left/right arrows
* partial cards
* "peek" cards
* horizontal swipe collection cards

Instead:

## USE A LARGE 2-COLUMN VISUAL GRID.

Mobile:

```text
┌────────────┐ ┌────────────┐
│            │ │            │
│            │ │            │
│   IMAGE    │ │   IMAGE    │
│            │ │            │
│            │ │            │
└────────────┘ └────────────┘
```

The images must be substantially larger than the current cards.

The customer should be able to appreciate:

* model
* garment
* fabric
* pattern
* styling
* composition

without opening the collection.

---

# 14 — FEATURED COLLECTION TEXT

Keep text extremely minimal.

Instead of:

```text
Featured Collections

Discover our latest curated collections...
Shop now...
```

use:

```text
FEATURED

[IMAGE]        [IMAGE]

EVERYDAY →     HANDLOOM →
```

Or even:

```text
EVERYDAY →
HANDLOOM →
```

The exact typography and placement should be editorial.

The image must remain dominant.

---

# 15 — COLLECTION CARD DESIGN

Collection cards are not conventional e-commerce cards.

Do not use:

* thick border
* heavy shadow
* giant rounded corners
* multiple badges
* paragraphs
* large buttons

The image is the component.

Collection name is supporting information.

Use subtle corner treatment only if it improves the photography.

---

# 16 — PRODUCT GRID

This is a strict requirement.

## ALWAYS PRIORITIZE A 2-COLUMN PRODUCT GRID.

### Mobile:

2 columns.

### Tablet:

2 columns.

### Desktop:

2 columns.

Do NOT automatically change to 3 or 4 columns on desktop.

The purpose is to make each photograph large.

---

# 17 — WHY 2 COLUMNS

Each product photograph should feel like editorial photography.

The customer should be able to see:

* garment silhouette
* model
* fabric
* color
* styling
* details

without opening the product immediately.

The website is deliberately giving the product photography more visual real estate.

---

# 18 — NO PRODUCT CAROUSELS

This is a hard requirement.

Do NOT use:

* horizontal product sliders
* left/right product carousels
* partial product cards
* swipe-only product browsing

Product discovery should happen through a proper grid.

```text
PRODUCT     PRODUCT

PRODUCT     PRODUCT

PRODUCT     PRODUCT
```

The user scrolls vertically.

---

# 19 — PRODUCT IMAGE SIZE

Increase product image size substantially compared with the current implementation.

Do not optimize the grid for:

> "How many products can we fit on screen?"

Optimize it for:

> "How beautiful can each product photograph look?"

The image is the product card.

---

# 20 — PRODUCT CARD PHILOSOPHY

The product card should feel like:

**A fashion photograph with shopping metadata.**

Not:

**A marketplace card.**

Structure:

```text
┌──────────────────────┐
│                      │
│                      │
│      PHOTOGRAPH      │
│                      │
│                      │
│                  ♡   │
└──────────────────────┘

Product Name
₹2,899
```

That's enough.

---

# 21 — PRODUCT CARD — REMOVE VISUAL NOISE

Avoid:

* giant badges
* thick borders
* shadows
* large rounded containers
* colorful sale banners
* discount percentages
* giant CTA buttons
* excessive metadata
* multiple icons
* large "NEW" labels

The customer should see the photograph first.

---

# 22 — NEW PRODUCT INDICATOR

If "NEW" is necessary, make it extremely subtle.

Example:

```text
• NEW
```

or:

```text
NEW
```

Use tiny typography.

Never:

```text
🔥 NEW ARRIVAL!!!
```

---

# 23 — SALE TREATMENT

Do not use "screaming sale" design.

Never use:

* huge SALE
* red badges
* percentage stickers
* giant discount blocks
* promotional ribbons

If sale information is necessary:

```text
₹2,899  ₹3,299
```

or:

```text
SALE
```

in restrained typography.

The photograph remains the dominant visual.

---

# 24 — WISHLIST

Use a small heart icon.

Place it subtly over the image or immediately adjacent to it.

Default:

outlined heart.

Selected:

filled heart.

Animation:

very small tactile scale.

Do not let the wishlist icon become a major visual element.

---

# 25 — PRODUCT IMAGE HOVER

Desktop:

If a secondary image exists:

Image 1
→ soft crossfade
→ Image 2

No aggressive zoom.

No dramatic movement.

No image jumping.

Mobile:

Do not rely on hover.

Use normal gallery behavior on the PDP.

---

# 26 — PRODUCT CARD TYPOGRAPHY

Product name:

Small, refined.

Price:

Small and readable.

Do not make price larger than the product image.

Do not make pricing visually aggressive.

Example:

```text
Handloom Kurta Set
₹3,499
```

No unnecessary copy.

---

# 27 — BACKGROUND SYSTEM

The current pure black-and-white approach is too flat.

However:

**Do not simply replace white with beige everywhere.**

The background system must be designed to **elevate the photography**.

Use a restrained neutral palette:

* warm ivory
* soft bone
* subtle stone
* warm off-white
* muted grey
* deep black

The exact background should depend on the photography and section.

---

# 28 — ADAPTIVE BACKGROUND PRINCIPLE

Use background tones strategically.

For example:

Red garment:

→ soft warm neutral.

Yellow garment:

→ ivory / cream.

Purple garment:

→ cool-neutral / soft stone.

Black collection:

→ deep black.

Editorial campaign:

→ photography itself can become the environment.

Do not use random colors.

Do not introduce bright decorative colors.

The background exists to make the clothing look better.

---

# 29 — BLACK EDIT / BLACK DRESS — MAJOR FEATURE

This is a critical new part of the JuneFourteen homepage.

JuneFourteen is developing a strong **ALL-BLACK fashion direction**.

This includes:

* black T-shirts
* black dresses
* black tops
* black everyday wear
* black party wear
* black occasion wear
* black contemporary pieces
* other black garments

This collection must have its own visual identity.

It should NOT look like an ordinary category section.

---

# 30 — BLACK EDIT VISUAL WORLD

Create a dedicated:

## BLACK EDIT

section.

The section should feel like entering another fashion environment.

Use:

```text
#050505
```

or another refined near-black.

Typography:

Warm white / soft white.

Photography:

High-quality black fashion photography.

The section should feel:

* cinematic
* elegant
* confident
* minimal
* luxurious
* monochromatic
* editorial

Do NOT make this look like:

"dark mode."

It is a **fashion campaign environment**.

---

# 31 — BLACK EDIT STRUCTURE

Possible composition:

```text
────────────────────────────

          BLACK EDIT

       LARGE IMAGE

────────────────────────────

   BLACK PRODUCT    BLACK PRODUCT

────────────────────────────

       LARGE IMAGE

────────────────────────────

   BLACK PRODUCT    BLACK PRODUCT

────────────────────────────
```

Use strong photography between product grids.

Do not fill this section with copy.

---

# 32 — BLACK EDIT TEXT

Possible heading:

```text
BLACK EDIT
```

or:

```text
THE BLACK EDIT
```

or:

```text
ALL BLACK
```

Choose the most premium option.

Do not add a paragraph.

Do not explain what the collection is.

Do not use promotional language.

The photographs should communicate the collection.

---

# 33 — BLACK EDIT PRODUCT CARDS

Maintain the same 2-column system.

Use:

* large photography
* minimal metadata
* warm-white typography
* subtle wishlist
* no loud sale badges
* no excessive labels

The cards should blend naturally into the black environment.

---

# 34 — BLACK EDIT IMAGE TREATMENT

Use the strongest available black-fashion photography.

Prefer:

* dramatic composition
* clean styling
* deep blacks
* model-focused imagery
* fabric detail
* negative space
* elegant lighting

Do not apply unnecessary filters.

Do not artificially make everything monochrome if the original photography contains useful tonal detail.

---

# 35 — HOMEPAGE SECTION ORDER

The homepage should approximately follow:

```text
HEADER

FULL-BLEED HERO
NO TEXT

↓

FEATURED COLLECTIONS
2-COLUMN VISUAL GRID

↓

NEW ARRIVALS
2-COLUMN PRODUCT GRID

↓

LARGE EDITORIAL / CAMPAIGN IMAGE

↓

BLACK EDIT
BLACK VISUAL ENVIRONMENT
2-COLUMN PRODUCT GRID
EDITORIAL IMAGES

↓

BEST SELLERS
2-COLUMN PRODUCT GRID

↓

FINAL CAMPAIGN IMAGE

↓

MINIMAL FOOTER
```

This is the default direction.

Adjust the exact order only if the actual photography creates a significantly stronger visual sequence.

---

# 36 — BEST SELLERS

Best Sellers should remain visually quiet.

Heading:

```text
BEST SELLERS
```

Optional:

```text
VIEW ALL →
```

Then:

2-column grid.

No carousel.

No horizontal scrolling.

No promotional banner.

No large text.

---

# 37 — FINAL CAMPAIGN SECTION

End the visual content with a strong campaign photograph.

This can be:

* full-width
* full-bleed
* large editorial image
* campaign composition

Prefer no text.

The final image should feel like the closing frame of a fashion editorial.

---

# 38 — REMOVE PHILOSOPHY FROM HOMEPAGE

Completely remove the current:

```text
OUR PHILOSOPHY

Made for the way you move.

Considered cuts, breathable cloth...
```

from the homepage.

Also remove:

```text
Read Our Story
```

from the homepage.

---

# 39 — ABOUT US

All brand storytelling belongs in:

## ABOUT US

inside the hamburger menu.

The About page can contain:

* brand story
* philosophy
* design approach
* craftsmanship
* materials
* founder story
* brand values
* visual storytelling

The homepage should not explain these things.

The homepage should show the brand.

---

# 40 — HOMEPAGE TEXT AUDIT

Every homepage text element must pass this question:

> "Does the customer actually need this text right now?"

If NO:

Remove it.

Remove:

* marketing paragraphs
* generic taglines
* repetitive headings
* explanatory copy
* unnecessary CTAs
* promotional descriptions

The homepage should contain **dramatically less text than the current implementation**.

---

# 41 — HAMBURGER MENU

Create a premium, minimal navigation drawer.

Suggested structure:

```text
NEW ARRIVALS

SHOP
    All
    Kurtas
    Sets
    Dresses
    Tops
    Bottoms
    Black Edit

COLLECTIONS

ABOUT
    Our Story
    Our Philosophy

HELP
    Shipping
    Returns
    Contact

ACCOUNT
```

Keep the navigation clean.

Do not create an enormous text-heavy mega-menu on mobile.

---

# 42 — SEARCH

Search should be visually minimal.

Mobile:

Full-screen search experience.

Desktop:

Clean overlay / search interface.

Use:

```text
SEARCH

[ Search input ]

Recent
Suggested
```

Do not overload it with filters.

---

# 43 — SHOP PAGE

The Shop page must follow the same photography-first philosophy.

Top:

Minimal category navigation.

Then:

```text
FILTER                 SORT
```

Then:

2-column product grid.

No carousel.

No tiny cards.

---

# 44 — FILTER UI

Desktop:

Compact filter control.

Mobile:

Bottom sheet.

Possible filters:

* Category
* Size
* Price
* Color
* Availability

Do not permanently display a wall of filter chips.

---

# 45 — SORT UI

Keep sorting simple:

```text
Featured
Newest
Price: Low → High
Price: High → Low
```

Mobile should use a clean bottom sheet.

---

# 46 — PRODUCT DETAIL PAGE

The PDP should be highly visual.

Photography must dominate.

Desktop:

Large image gallery.

Product information beside or below it depending on layout.

Mobile:

Large swipeable gallery.

---

# 47 — PDP CONTENT HIERARCHY

Keep product information concise.

Example:

```text
Handloom Kurta Set

₹3,499

XS   S   M   L   XL   2XL

Sleeve

3/4
Full

ADD TO BAG

BUY NOW
```

Then progressive disclosure:

```text
Details
Fabric & Care
Shipping
Returns
Size Chart
```

Do not show large paragraphs by default.

---

# 48 — PDP IMAGE GALLERY

Support:

* swipe
* tap
* zoom
* fullscreen
* image navigation

Desktop:

Large editorial image area.

Mobile:

Large vertical gallery or swipe gallery.

Do not cover important parts of the photography with UI.

---

# 49 — CUSTOM SIZE

Preserve custom sizing functionality.

But do not expose the entire measurement form by default.

Flow:

```text
CUSTOM SIZE
↓
BOTTOM SHEET
↓
CM / INCH
↓
MEASUREMENTS
↓
SAVE
```

Keep it clean.

---

# 50 — SIZE CHART

Use a modal or bottom sheet.

Keep the size chart easy to understand.

Do not let it dominate the PDP.

---

# 51 — PURCHASE CTA

The primary purchase action must remain obvious.

Use:

**ADD TO BAG**

as the primary CTA.

Use:

**BUY NOW**

as secondary if applicable.

Button styling:

* black
* refined
* high contrast
* tactile
* generous touch target

Do not use bright colors.

---

# 52 — STICKY PURCHASE BAR

After the primary purchase section leaves the viewport, a compact contextual purchase bar may appear.

Mobile:

Very compact.

Desktop:

Subtle.

Do not cover product photography unnecessarily.

---

# 53 — CART

Cart should use the same premium minimal language.

Show:

* product image
* product name
* variant
* size
* quantity
* price

Then:

```text
SUBTOTAL
CHECKOUT
```

No unnecessary promotional clutter.

---

# 54 — WISHLIST PAGE

Wishlist:

2-column product grid.

Large photography.

Minimal metadata.

Same product card component as Shop.

---

# 55 — FOOTER

Keep footer minimal.

Suggested:

```text
SHOP
HELP
CONTACT
ABOUT
INSTAGRAM
```

Newsletter can exist but should remain visually restrained.

Do not write large brand paragraphs.

---

# 56 — TYPOGRAPHY

Typography should feel like a fashion brand.

Use a sophisticated combination of:

### Editorial Serif

For:

* major campaign moments
* occasional collection headings
* fashion-editorial statements

### Modern Sans

For:

* navigation
* product names
* prices
* filters
* buttons
* interface

Possible sans:

* Geist
* Inter

Use the project's existing font system if it is already high quality.

Do not introduce unnecessary fonts.

Typography must remain quiet.

---

# 57 — TYPOGRAPHY SCALE

Avoid:

* giant startup headlines
* huge marketing text
* excessive bold weights

Large type should be reserved for special editorial moments.

Most UI typography should be small and refined.

---

# 58 — COLOR SYSTEM

The core visual system should remain:

```text
BLACK
WHITE
WARM NEUTRALS
```

Do NOT introduce bright colors as decoration.

Amber from the previous design direction should be **de-emphasized**.

It should not become a visible brand color.

If amber exists in existing functionality/data, preserve it only where necessary.

The overall website should visually read as:

**MONOCHROME + REFINED NEUTRALS**

with the photography providing the color.

---

# 59 — PHOTOGRAPHY PROVIDES THE COLOR

This is extremely important.

Do not decorate the website with many colors.

The garments and photography should provide the color.

The UI should remain restrained so that:

* red garments pop
* yellow garments pop
* purple garments pop
* patterned fabrics pop
* black garments feel sophisticated

---

# 60 — CARDS

Not everything should be inside a card.

Avoid the standard:

```text
rounded rectangle
+
shadow
+
border
+
image
+
badge
+
button
```

Instead:

```text
IMAGE
small spacing
NAME
PRICE
```

The photograph itself creates the visual structure.

---

# 61 — BORDERS

Use very few borders.

Prefer:

* spacing
* tonal contrast
* typography
* image composition

Hairline dividers are acceptable where useful.

---

# 62 — SHADOWS

Do not use shadows on every card.

Use shadows only for:

* drawer
* bottom sheet
* modal
* floating controls

The main page should remain flat and editorial.

---

# 63 — CORNER RADIUS

Do not excessively round everything.

Large editorial imagery may use:

* square corners
* very subtle radius
* carefully selected radius

The website should not look like a mobile banking app.

---

# 64 — IOS-QUALITY INTERACTION

The goal is:

**iOS-quality interaction design**

NOT:

**copy Apple's visual design.**

Use:

* excellent touch targets
* smooth sheets
* subtle spring motion
* clean drawers
* tactile buttons
* progressive disclosure
* smooth transitions
* clear hierarchy

Avoid:

* glassmorphism everywhere
* excessive blur
* giant pills
* rounded cards everywhere
* dashboard-style components

---

# 65 — ANIMATION

Use motion carefully.

Good:

* image crossfade
* subtle hover transition
* drawer slide
* bottom sheet animation
* wishlist feedback
* page transitions
* small arrow movement

Avoid:

* excessive parallax
* bouncing elements
* dramatic zoom
* animated text everywhere
* scroll-jacking

The website should feel calm.

---

# 66 — PRODUCT IMAGE TRANSITIONS

If a second image exists:

On desktop:

```text
IMAGE 1
↓
soft crossfade
↓
IMAGE 2
```

No aggressive zoom.

No transform that distorts the photograph.

---

# 67 — RESPONSIVE DESIGN

## MOBILE

Primary target:

390px viewport.

Requirements:

* 2-column product grid
* 2-column collection grid
* large image areas
* correct cropping
* no horizontal overflow
* minimal text
* thumb-friendly controls
* proper safe-area spacing
* touch targets ≥ 44px

## DESKTOP

Primary test:

1440px viewport.

Requirements:

* 2-column product grid
* large product imagery
* generous margins
* editorial composition
* controlled content width
* no unnecessary empty space

---

# 68 — MOBILE MUST NOT FEEL LIKE COMPRESSED DESKTOP

Mobile should be intentionally designed.

Do not simply:

```text
desktop
↓
smaller fonts
↓
smaller cards
```

Instead design the mobile composition independently.

The customer should feel like they are scrolling through a mobile fashion editorial.

---

# 69 — IMAGE HANDLING

Photography is the core of the website.

Therefore image handling is critical.

Use:

* Next/Image
* responsive sizes
* lazy loading below fold
* correct image dimensions
* modern formats
* optimized loading
* blur placeholders if appropriate
* priority loading for hero

Do not load huge originals unnecessarily.

---

# 70 — IMAGE CROPPING

Never aggressively crop:

* faces
* garments
* important patterns
* model hands
* footwear when it contributes to styling
* important garment details

Use object positioning intentionally.

If necessary, define responsive focal points per image.

---

# 71 — PERFORMANCE

The website is photography-heavy.

Maintain excellent performance.

Prevent:

* layout shift
* oversized images
* unnecessary JS
* unnecessary animations
* duplicate image loading

Prioritize the hero.

Lazy-load below-the-fold content.

---

# 72 — TECHNICAL ARCHITECTURE

Preserve the useful existing architecture.

Use typed data models such as:

```text
Product
ProductVariant
ProductImage
Collection
CartItem
WishlistItem
CustomMeasurement
```

Keep repository/data logic separated from UI.

Supabase may be integrated later.

Do not build Supabase as part of this redesign unless already required by the existing project.

---

# 73 — STATE MANAGEMENT

Preserve or use Zustand for:

* Cart
* Wishlist

Persist appropriate state to localStorage.

Cart items should support:

* product
* variant
* size
* sleeve
* quantity
* custom measurements

Do not break existing cart functionality during visual redesign.

---

# 74 — FUNCTIONALITY TO PRESERVE

Do NOT remove working functionality.

Preserve:

* product browsing
* product details
* image gallery
* wishlist
* cart
* size selection
* sleeve selection
* custom sizing
* size chart
* quantity
* search
* filters
* sorting
* shipping estimator
* checkout shell
* responsive behavior

The redesign is primarily a:

**VISUAL + UX TRANSFORMATION**

not a business-logic rewrite.

---

# 75 — MOCK DATA

Maintain realistic fashion products.

At least:

**15–20 products**

Each product should support:

* name
* price
* images
* category
* collection
* sizes
* sleeve options
* availability
* sale state
* custom-size availability

Use the best available photography.

Do not use generic placeholders if real project assets exist.

---

# 76 — PRODUCT IMAGE PRIORITIZATION

When multiple product photographs exist:

Prioritize the image that best communicates:

1. garment
2. model
3. styling
4. composition

Do not automatically use the first image.

The homepage is a curated editorial experience.

---

# 77 — HOMEPAGE IMAGE CURATION

Select images deliberately for:

### Hero

Strongest campaign photograph.

### Featured Collections

Strong collection-defining images.

### New Arrivals

Strongest product photographs.

### Editorial sections

Images with visual variation.

### Black Edit

Strongest black-fashion photographs.

### Best Sellers

Best-performing / strongest product imagery.

---

# 78 — DO NOT INVENT PHOTOGRAPHY

If real project assets exist:

Use them.

Do not replace them with arbitrary generated placeholders.

If an image does not exist for a section:

Use the best available related asset rather than inventing a visual concept that cannot be implemented.

---

# 79 — VISUAL RHYTHM

Avoid repeating:

```text
heading
grid
heading
grid
heading
grid
```

Instead:

```text
IMAGE

GRID

IMAGE

GRID

BLACK EDIT

GRID

IMAGE
```

Use scale variation.

Use image-led transitions.

Make the page feel composed.

---

# 80 — HOMEPAGE DENSITY

The goal is:

**FEWER UI ELEMENTS**

but:

**STRONGER VISUAL IMPACT**

Do not interpret minimalism as enormous empty gaps.

Minimalism means:

* fewer words
* fewer controls
* fewer borders
* fewer badges
* fewer decorative components

while maintaining strong visual composition.

---

# 81 — SHOPPING UX

Minimal design must not make shopping difficult.

The user journey must remain obvious:

```text
DISCOVER
↓
SEE PRODUCT
↓
OPEN PRODUCT
↓
SELECT SIZE
↓
ADD TO BAG
↓
CHECKOUT
```

Do not hide essential shopping controls for the sake of minimalism.

---

# 82 — ACCESSIBILITY

Maintain:

* semantic HTML
* keyboard navigation
* accessible buttons
* ARIA labels
* focus states
* minimum 44px touch targets
* accessible modals
* accessible bottom sheets
* adequate contrast
* readable text

Premium design must remain usable.

---

# 83 — COMPONENT ARCHITECTURE

Refactor components where necessary.

Do not blindly preserve old components if they enforce the wrong visual structure.

Potential architecture:

```text
HeroEditorial
EditorialCollectionGrid
EditorialCollectionCard
EditorialProductGrid
EditorialProductCard
CampaignImageSection
BlackEditSection
BlackEditProductGrid
Header
MobileNavigation
SearchOverlay
FilterSheet
SortSheet
ProductGallery
ProductInfo
SizeSelector
CustomSizeSheet
CartDrawer
WishlistGrid
Footer
```

Use reusable components.

Avoid duplicated markup.

---

# 84 — PRODUCT CARD IS A HIGH-PRIORITY COMPONENT

Perfect the product card before building the rest of the experience.

Test:

### Mobile 390px

Can the customer immediately understand:

* product
* image
* name
* price

without visual clutter?

### Desktop 1440px

Does the product feel:

* large
* editorial
* premium
* photographically important?

If not:

**increase image prominence.**

---

# 85 — DESIGN QA QUESTIONS

After implementation ask:

### QUESTION 1

Does the hero work without text?

If no:

Fix the photography/layout.

Do not add a paragraph.

---

### QUESTION 2

Does the homepage look like a fashion campaign?

If no:

Redesign the composition.

---

### QUESTION 3

Are the product photographs large enough?

If no:

Increase the grid/image size.

---

### QUESTION 4

Does the website look like a generic Shopify template?

If yes:

Remove/rethink generic patterns.

---

### QUESTION 5

Is there unnecessary text?

If yes:

Delete it.

---

### QUESTION 6

Is the UI competing with the clothing?

If yes:

Remove UI.

---

### QUESTION 7

Does Black Edit feel like a distinct premium fashion chapter?

If no:

Redesign it.

---

### QUESTION 8

Does the background elevate the product photography?

If no:

Change the tonal environment.

---

### QUESTION 9

Does mobile feel intentionally designed?

If no:

Redesign mobile rather than shrinking desktop.

---

# 86 — DO NOT USE THESE PATTERNS

Absolutely avoid:

* generic Shopify-looking layouts
* giant promotional hero text
* screaming SALE badges
* red sale stickers
* large discount percentages
* horizontal product carousels
* horizontal collection carousels
* 3/4-column product grids
* tiny product images
* excessive product metadata
* huge rounded cards
* excessive shadows
* excessive borders
* glassmorphism everywhere
* giant pills
* excessive amber
* unnecessary paragraphs
* marketing-heavy homepage
* dashboard-like UI
* SaaS-style hero
* giant CTA overlays
* excessive icons
* unnecessary animations
* decorative UI without purpose

---

# 87 — WHAT THE HOMEPAGE SHOULD NOT FEEL LIKE

It should NOT feel like:

Amazon.

Myntra.

A generic Shopify theme.

A marketplace.

A SaaS landing page.

A dashboard.

A template.

A promotional sale website.

---

# 88 — WHAT IT SHOULD FEEL LIKE

It should feel like:

A fashion magazine.

A luxury lookbook.

A contemporary Indian fashion label.

A digital campaign.

A curated editorial.

A premium shopping experience.

---

# 89 — FINAL VISUAL LANGUAGE

The final language should be:

**QUIET**

**VISUAL**

**EDITORIAL**

**PREMIUM**

**PHOTOGRAPHIC**

**MODERN**

**CONFIDENT**

**MINIMAL**

**EASY TO SHOP**

---

# 90 — IMPLEMENTATION PROCESS

Do NOT immediately start changing random CSS.

Follow this process.

## STEP 1 — INSPECT

First inspect the entire existing project.

Understand:

* routes
* pages
* components
* data
* stores
* assets
* image structure
* product architecture
* existing functionality
* current responsive behavior

Do not modify anything yet.

---

## STEP 2 — AUDIT

Identify:

### KEEP

Components/functionality that already work.

### REWORK

Components whose structure is useful but whose visual design is wrong.

### REPLACE

Components whose architecture conflicts with V3.

### REMOVE

Homepage sections that violate the new direction.

---

## STEP 3 — ASSET AUDIT

Inspect available photography.

Categorize images into:

* Hero
* Collection
* New Arrivals
* Editorial
* Black Edit
* Best Sellers
* PDP gallery

Select photography intentionally.

---

## STEP 4 — DESIGN SYSTEM

Before rebuilding pages establish:

* typography
* spacing
* colors
* image ratios
* icon system
* buttons
* wishlist
* header
* drawer
* bottom sheet
* animation timing

---

## STEP 5 — BUILD PRODUCT CARD

Perfect:

`EditorialProductCard`

before building the entire homepage.

---

## STEP 6 — BUILD COLLECTION GRID

Create:

`EditorialCollectionGrid`

with:

2 columns.

No carousel.

---

## STEP 7 — BUILD HERO

Create:

`HeroEditorial`

with:

**NO TEXT BY DEFAULT.**

---

## STEP 8 — BUILD HOMEPAGE

Build the homepage around:

```text
HERO
↓
FEATURED
↓
NEW ARRIVALS
↓
EDITORIAL IMAGE
↓
BLACK EDIT
↓
BEST SELLERS
↓
FINAL CAMPAIGN
```

---

## STEP 9 — REDESIGN SHOP

Use the same visual language.

2-column grid.

Minimal filters.

---

## STEP 10 — REDESIGN PDP

Photography-first.

Minimal product information.

Progressive disclosure.

---

## STEP 11 — REDESIGN CART / WISHLIST / SEARCH

Make the secondary experiences visually consistent.

---

## STEP 12 — MOBILE QA

Test:

* 320px
* 375px
* 390px
* 430px

Fix:

* cropping
* spacing
* overflow
* touch targets
* text wrapping
* image quality
* header
* bottom sheets

---

## STEP 13 — DESKTOP QA

Test:

* 1280px
* 1440px
* 1728px

Fix:

* image proportions
* whitespace
* content width
* typography
* grid scale
* header alignment

---

# 91 — PERFORMANCE QA

Verify:

* hero image priority
* lazy loading
* image sizes
* layout stability
* no unnecessary image requests
* no horizontal overflow
* no excessive JavaScript
* no broken responsive image behavior

---

# 92 — FUNCTIONAL QA

Verify:

* product navigation
* wishlist
* cart
* quantity
* size
* sleeve
* custom size
* size chart
* search
* filters
* sorting
* shipping estimator
* checkout shell
* responsive behavior

Do not sacrifice functionality for visual minimalism.

---

# 93 — FINAL DESIGN TEST

The final site should pass this test:

If all product names, prices and UI controls disappeared temporarily, the homepage should **still look like a premium fashion campaign.**

That means the photography and composition are strong enough.

Then restore the shopping information.

The result should still feel minimal.

---

# 94 — FINAL CUSTOMER EXPERIENCE

The ideal customer journey:

```text
OPEN SITE
     ↓
SEE BEAUTIFUL PHOTOGRAPHY
     ↓
BECOME CURIOUS
     ↓
DISCOVER COLLECTION
     ↓
SEE LARGE PRODUCT PHOTOGRAPHY
     ↓
OPEN PRODUCT
     ↓
VIEW LARGE GALLERY
     ↓
SELECT SIZE
     ↓
ADD TO BAG
     ↓
CHECKOUT
```

The interface should never interrupt this flow.

---

# 95 — FINAL DESIGN PRINCIPLE

Remember this throughout implementation:

> **THE WEBSITE IS NOT SELLING PRODUCTS WITH PHOTOGRAPHS.**
>
> **THE WEBSITE IS SELLING THE PHOTOGRAPHIC EXPERIENCE OF THE PRODUCTS.**

The clothing, models, styling, fabric, color, composition and photography are the primary content.

The UI is supporting infrastructure.

---

# 96 — FINAL NON-NEGOTIABLES

Before finishing, verify all of these:

* [ ] Hero has no unnecessary text
* [ ] Hero is visually dominant
* [ ] Featured Collections use 2-column visual grid
* [ ] No horizontal collection carousel
* [ ] New Arrivals use 2-column product grid
* [ ] No horizontal product carousel
* [ ] Product images are substantially larger
* [ ] Product cards are quiet and premium
* [ ] No screaming SALE UI
* [ ] No excessive badges
* [ ] No excessive text
* [ ] No homepage philosophy section
* [ ] No homepage story section
* [ ] About/Philosophy moved to About Us
* [ ] Background tones elevate photography
* [ ] Black Edit has dedicated black visual environment
* [ ] Black Edit uses large photography
* [ ] Black Edit uses 2-column product grid
* [ ] Best Sellers use 2-column product grid
* [ ] Final campaign image exists
* [ ] Mobile is intentionally designed
* [ ] Desktop is intentionally designed
* [ ] Product photography remains the dominant visual
* [ ] Shopping functionality remains intact
* [ ] Accessibility remains intact
* [ ] Performance remains strong

---

# 97 — FINAL COMMAND TO CLAUDE

DO NOT treat this as a request to "make the current website prettier."

Treat this as a **complete visual and UX transformation of JuneFourteen.**

First inspect the existing project.

Then audit the current implementation against this V3 specification.

Then identify what should be:

* preserved
* redesigned
* replaced
* removed

Then implement the redesign systematically.

Do not make random incremental CSS changes.

Do not stop after changing fonts and colors.

Do not stop after making cards slightly cleaner.

Do not preserve a layout simply because it already exists.

If the existing structure conflicts with the V3 direction, restructure it.

The final result must feel like a **completely new JuneFourteen website**.

The final design target is:

```text
PHOTOGRAPHY FIRST
        +
MINIMAL TEXT
        +
LARGE 2-COLUMN GRIDS
        +
EDITORIAL PRODUCT CARDS
        +
FULL-BLEED CAMPAIGN PHOTOGRAPHY
        +
DEDICATED BLACK EDIT
        +
REFINED NEUTRALS
        +
QUIET UI
        +
IOS-QUALITY INTERACTION
        +
EFFORTLESS SHOPPING
```

The final emotional impression should be:

# JUNEFOURTEEN FEELS LIKE A PREMIUM FASHION LABEL.

Not a generic online store.

Not a marketplace.

Not a template.

Not a SaaS interface.

**A fashion brand with an exceptionally beautiful digital presence.**

START BY INSPECTING THE EXISTING PROJECT.
