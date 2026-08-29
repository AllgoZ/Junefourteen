-- Makes /privacy and /terms admin-editable. Two named rows, not a
-- boolean-singleton like other one-row tables — `slug` is the natural key,
-- constrained to exactly these two pages. `body` is free text using a
-- minimal, dependency-free convention (see components/marketing/
-- legal-page-body.tsx): a line starting with "## " begins a new section
-- (rendered as <h2>), blank-line-separated blocks are paragraphs. Seeded
-- with today's exact copy from both pages so publishing this changes
-- nothing on the live site until an admin edits something.

create table public.legal_pages (
  slug text primary key check (slug in ('privacy', 'terms')),
  title text not null,
  subtitle text not null default '',
  body text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.legal_pages (slug, title, subtitle, body) values
(
  'privacy',
  'Privacy Policy',
  'Last updated August 2026.',
  'This is a prototype storefront. No real customer accounts, payments, or orders are processed on this site yet — any information entered into forms here (newsletter, contact, checkout) is not transmitted or stored beyond your own browser session.

## What We Store Locally
To demonstrate cart, wishlist, and recent-search functionality, this prototype stores data in your browser’s local storage only. It never leaves your device and is cleared if you clear your browser data.

## Future Data Handling
When JUNEFOURTEEN launches with a real backend, this policy will be updated to describe what account, order, and payment data we collect and how it’s used.

## Contact
Questions? Reach us at team.Junefourteen@gmail.com.'
),
(
  'terms',
  'Terms of Service',
  'Last updated August 2026.',
  'This site is currently a frontend prototype for JUNEFOURTEEN. No purchases can be completed and no payment is processed — the checkout flow is for demonstration only.

## Product Information
Product names, descriptions, and pricing shown here are illustrative placeholders and do not represent a live catalog.

## Use of This Site
You’re welcome to browse and interact with every feature to evaluate the experience. Please don’t submit real personal or payment information through any form on this prototype.

## Contact
Questions about these terms? Reach us at team.Junefourteen@gmail.com.'
);

create trigger set_updated_at before update on public.legal_pages
  for each row execute function public.set_updated_at();

-- No policies: read via the service-role client only, same convention as
-- tax_settings/homepage_campaign/about_page_content.
alter table public.legal_pages enable row level security;
