# JUNEFOURTEEN — Admin Panel Walkthrough

This is a plain-language guide to running the JUNEFOURTEEN website day to
day. It's written for whoever manages the store — not for developers (see
`Architecture Files/ARCHITECTURE.md` for the technical documentation).

Every section below is listed in the same order it appears in the admin
sidebar, so you can follow along top to bottom.

---

## Signing in

Go to **`/admin/login`** on your site (for example,
`https://junefourteen.in/admin/login`) and sign in with your admin email
and password.

There's no public "sign up" button for admin access — that's deliberate,
so a random visitor can never create themselves an admin account. If you
need a new person added as an admin, they should first create a normal
customer account on the site, and then your developer can flip that one
account to admin for them.

---

## Dashboard

The homepage of the admin panel. A quick snapshot of the store: recent
orders, order/revenue counts, and a handful of key numbers at a glance.
Nothing to configure here — it's read-only.

---

## Products

Your full catalog. From here you can:

- **Add a new product** — name, price, description, fabric/care details,
  sizes, images, and which Collections it belongs to.
- **Edit an existing product** — same fields, plus you can upload,
  reorder, or delete photos. The first photo in the list is always the
  one shown on the shop grid.
- **Mark a product as Sold Out** — this is the one flag that actually
  stops customers from buying it. When a product is sold out, its "Add to
  Bag" button is replaced on the product page with **"Request to Order"**
  (more on that under **Order Requests** below).
- **Select multiple products** (checkboxes on the list) to activate,
  deactivate, or delete several at once.
- **Deactivating** a product hides it from the live site without deleting
  its data or order history — this is the safe way to temporarily pull a
  product. Deleting is only allowed for a product that has never actually
  been ordered.

## Inventory

A simple stock-tracking view across every product — current stock count
and a low-stock warning threshold, editable inline right in the table.

Important: **this is for your own visibility only.** Changing a stock
number here does **not** automatically mark a product Sold Out or stop
people from buying it. The **Sold Out** toggle on the product itself
(under Products) is the only thing that actually blocks a purchase — think
of Inventory as your notebook, and the Sold Out flag as the light switch.

---

## Collections

Manage the named collections shown on the shop (e.g. "New Arrivals",
seasonal edits) — name, description, cover photo, and which products
belong to each.

Two more things live on this same page, above the collections list,
because they're both single homepage images rather than full catalog
items:

- **Shop Collection Banner** — the large full-bleed photo shown further
  down the homepage, with its own headline link (e.g. "Shop Collection")
  and destination URL. Replace the image and edit the link text/URL right
  here.
- **Follow Along Grid** — the four Instagram-style photos on the
  homepage's "Follow Along" section. Each tile is replaced independently
  — click into a tile, upload a new photo, save. (The Instagram link
  itself, that these photos open when clicked, is set under **Settings**.)

---

## Banners

The rotating photo(s) at the very top of the homepage (the "hero"). You
can:

- Upload a banner image (a separate one for desktop/laptop and mobile is
  supported, so a tall portrait crop can be used on phones instead of just
  squeezing the same photo).
- Add a link so the whole photo is clickable (e.g. straight to a
  collection or the shop page).
- Add **several active banners** to get a rotating carousel — one banner
  active means a static hero image, more than one means it rotates.
- Reorder or deactivate individual banners.

---

## About Page

Full control over the `/about` page's text and photos — the intro
paragraph, the "Our Story" and "Our Philosophy" sections (each with its
own heading, paragraph, and photo), and the closing "Journal" note. Edit
any of it here and save — the live page updates immediately, no code
changes needed.

---

## Orders

Every order placed on the site, with payment and fulfillment status.
Click into an order to see full details: items, customer info, delivery
address, and payment status.

From an order's detail page you can:

- **Update its status** (Pending → Confirmed → Processing → Shipped →
  Delivered, or Cancelled).
- **Add a tracking number and link** once it ships — this shows up
  automatically on the customer's own order page.

---

## Order Requests

**"Request to Order"** is what a customer sees instead of "Add to Bag"
when a product is marked Sold Out (see **Products** above). Instead of a
dead end, they can submit their name, phone, email (optional), size,
quantity, and delivery address, and see a confirmation that someone will
follow up.

This page is where those requests land. For each one you can see the
product, the customer's contact details, what they asked for, and update
its status as you work through it:

- **New** — just came in, nobody's followed up yet.
- **Contacted** — you've reached out to the customer.
- **Fulfilled** — the order was arranged and completed.
- **Cancelled** — didn't go ahead.

Filter the list by status to see, for example, only the ones still
waiting on a first contact. The customer can also see their own request
and its current status under their **Account → Order Requests** tab, so
keeping this up to date is worth doing.

---

## Shipping

The delivery zones and rates used at checkout. Each zone is a set of
Indian states, a flat delivery charge, an optional "free delivery above
₹X" threshold, and an estimated delivery window (e.g. "3–5 business
days"). Mark one zone as the **default** — that's the rate used for any
state you haven't explicitly added to a zone.

---

## Coupons

Discount codes customers can apply at checkout — percentage or fixed
amount off, an optional minimum order value, an optional start/expiry
date, and an optional usage limit. The "times used" count updates itself
automatically as customers use the code; you don't need to touch it.

---

## Customers

A read-only list of everyone with an account — useful for looking someone
up, seeing their order history, and viewing their saved addresses. You
can't edit a customer's details from here (they manage their own profile);
this is a lookup tool, not a CRM.

---

## Legal Pages

Edit the `/privacy` and `/terms` pages' full text — heading, subtitle
(e.g. "Last updated..."), and the full body content, including adding new
sections.

To add a new section heading anywhere in the text, start a line with
`## ` followed by the heading (for example: `## Cookies`), and leave a
blank line before and after it. Everything else is just plain paragraphs
— leave a blank line between paragraphs to separate them.

---

## Settings

A few store-wide, one-off settings live here:

- **Account** — change your own admin email or password.
- **Social Links** — your Instagram (and any other social) URL, used both
  in the site footer and as the link the homepage's "Follow Along" photos
  open.
- **Tax** — a single store-wide tax rate (e.g. GST), applied on top of
  every order's subtotal at checkout. Turned off by default until you
  switch it on here.

---

## Payments — one important note

Checkout is connected to a **live** Razorpay account, meaning **every
completed checkout on the site charges a real card/UPI/etc. for real
money.** There is no "test mode" active on the live site. Keep this in
mind if you or anyone else is ever testing the checkout flow — a real
transaction will go through.

---

## Getting help

For anything not covered here — a bug, a new feature, or a question about
how something works under the hood — that's a conversation for your
developer, not something to troubleshoot from this guide. The technical
documentation for them lives in `Architecture Files/ARCHITECTURE.md`.
