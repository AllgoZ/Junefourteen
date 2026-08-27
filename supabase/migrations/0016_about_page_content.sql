-- Makes the /about page's copy and images admin-editable. Singleton row,
-- same trick as tax_settings/homepage_campaign (id boolean primary key
-- default true check (id)). Seeded with today's exact hardcoded copy from
-- app/(site)/about/page.tsx so publishing this changes nothing on the live
-- site until an admin actually edits something from /admin/about.

create table public.about_page_content (
  id boolean primary key default true check (id),

  hero_image_url text not null,
  hero_cloudinary_public_id text,
  hero_image_alt text not null default '',

  heading text not null default '',
  intro_body text not null default '',

  story_eyebrow text not null default '',
  story_title text not null default '',
  story_body text not null default '',
  story_image_url text not null,
  story_cloudinary_public_id text,
  story_image_alt text not null default '',

  philosophy_eyebrow text not null default '',
  philosophy_title text not null default '',
  philosophy_body text not null default '',
  philosophy_image_url text not null,
  philosophy_cloudinary_public_id text,
  philosophy_image_alt text not null default '',

  journal_eyebrow text not null default '',
  journal_title text not null default '',
  journal_body text not null default '',

  updated_at timestamptz not null default now()
);

insert into public.about_page_content (
  id, hero_image_url, hero_image_alt, heading, intro_body,
  story_eyebrow, story_title, story_body, story_image_url, story_image_alt,
  philosophy_eyebrow, philosophy_title, philosophy_body, philosophy_image_url, philosophy_image_alt,
  journal_eyebrow, journal_title, journal_body
) values (
  true,
  '/images/models-duo-red-maroon-sets.webp',
  'JUNEFOURTEEN studio',
  'Quietly Bold',
  'JUNEFOURTEEN began as a small studio working directly with handloom weavers across South India. What started as a handful of pieces made for friends has grown into a considered edit of everyday and occasion wear — still built the same way, one length of cloth at a time.',
  'Our Story',
  'Built on craft, not trend.',
  'Every JUNEFOURTEEN piece begins with a relationship, not a spreadsheet — the weavers and tailors we work with have shaped this label as much as we have. That relationship is why our pieces carry the small irregularities of handmade cloth, and why we''d rather make less, better.',
  '/images/model-half-saree-mustard-purple.webp',
  'JUNEFOURTEEN weaving process',
  'Our Philosophy',
  'Made for the way you move.',
  'We design around the body in motion, not the mannequin at rest. Every cut is tested for how it feels to sit, walk, and reach — not just how it photographs.',
  '/images/model-mustard-kurta-kalamkari-dupatta.webp',
  'JUNEFOURTEEN design process',
  'Journal',
  'Notes From the Studio',
  'Our journal — weaver profiles, styling notes, and behind-the-scenes from the studio — is launching soon.'
);

create trigger set_updated_at before update on public.about_page_content
  for each row execute function public.set_updated_at();

-- No policies: read via the service-role client only, same convention as
-- tax_settings/homepage_campaign/shipping_zones.
alter table public.about_page_content enable row level security;
