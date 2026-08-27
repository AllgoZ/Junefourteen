import Link from "next/link";
import { Container } from "@/components/layout/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { site } from "@/lib/config/site";
import { getSocialLinks } from "@/lib/services/social-links";

/** lucide-react dropped brand/logo glyphs — inline monochrome glyph instead, colored via currentColor like every other icon here. */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const FOOTER_COLUMNS = [
  { title: "Shop", links: site.footer.shop },
  { title: "Help", links: site.footer.help },
];

const AUX_LINKS = [site.footer.company[0], ...site.footer.legal.slice(0, 2)];

function FooterLinks({ links }: { links: readonly { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {links.map((link) => (
        <li key={link.label}>
          <Link href={link.href} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export async function SiteFooter() {
  const dbSocialLinks = await getSocialLinks();
  // Fall back to the hardcoded defaults until the admin has added any —
  // matches the same "never render empty" pattern as the hero banners.
  // Instagram only in the footer, by design — filtered even if an admin
  // later adds more rows via Settings.
  const socialLinks = (dbSocialLinks.length > 0 ? dbSocialLinks : site.social).filter(
    (s) => s.label === "Instagram"
  );

  return (
    <footer className="border-t border-border bg-offwhite">
      <Container className="py-12 sm:py-16">
        {/* Desktop: two-column layout */}
        <div className="hidden grid-cols-2 gap-x-16 sm:grid sm:w-fit">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                {col.title}
              </p>
              <FooterLinks links={col.links} />
            </div>
          ))}
        </div>

        {/* Mobile: accordion nav instead of a flat wall of links */}
        <Accordion type="single" collapsible className="sm:hidden">
          {FOOTER_COLUMNS.map((col) => (
            <AccordionItem key={col.title} value={col.title}>
              <AccordionTrigger className="text-sm font-medium tracking-[0.08em] text-foreground uppercase">
                {col.title}
              </AccordionTrigger>
              <AccordionContent>
                <FooterLinks links={col.links} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 flex flex-col-reverse items-center gap-4 border-t border-border pt-6 sm:mt-12 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-start">
            <span>
              © {new Date().getFullYear()} {site.name}
            </span>
            {AUX_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
              >
                <InstagramGlyph />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
