import Link from "next/link";
import { Container } from "@/components/layout/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { site } from "@/lib/config/site";

/** lucide-react dropped brand/logo glyphs, so social links use a short monogram instead of an icon. */
const SOCIAL_MONOGRAMS: Record<string, string> = {
  Instagram: "IG",
  Pinterest: "P",
  Facebook: "FB",
};

const FOOTER_COLUMNS = [
  { title: "Shop", links: site.footer.shop },
  { title: "Help", links: site.footer.help },
  { title: "Company", links: site.footer.company },
  { title: "Legal", links: site.footer.legal },
];

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

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-offwhite">
      <Container className="py-14 sm:py-20">
        <div className="mb-12 flex flex-col gap-8 border-b border-border pb-12 sm:mb-16 sm:flex-row sm:items-end sm:justify-between sm:pb-16">
          <p className="max-w-md text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Made thoughtfully.
            <br />
            Worn endlessly.
          </p>
          <NewsletterForm className="sm:max-w-xs" />
        </div>

        {/* Desktop: four-column layout */}
        <div className="hidden grid-cols-4 gap-x-10 sm:grid">
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

        <div className="mt-12 flex flex-col-reverse items-center gap-4 border-t border-border pt-6 sm:mt-16 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {site.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex size-9 items-center justify-center rounded-full border border-border text-[11px] font-medium tracking-wide text-foreground transition-colors hover:bg-muted"
              >
                {SOCIAL_MONOGRAMS[s.label] ?? s.label[0]}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
