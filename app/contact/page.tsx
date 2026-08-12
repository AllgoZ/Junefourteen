import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { StaticPage } from "@/components/marketing/static-page";
import { ContactForm } from "@/components/marketing/contact-form";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${site.name} studio.`,
};

export default function ContactPage() {
  return (
    <StaticPage title="Contact" subtitle="We usually respond within 1–2 business days.">
      <div className="flex flex-col gap-2 text-sm">
        <a href={`mailto:${site.contactEmail}`} className="flex items-center gap-2 text-foreground">
          <Mail className="size-4" aria-hidden="true" /> {site.contactEmail}
        </a>
        <a href={`tel:${site.contactPhone}`} className="flex items-center gap-2 text-foreground">
          <Phone className="size-4" aria-hidden="true" /> {site.contactPhone}
        </a>
      </div>
      <ContactForm />
    </StaticPage>
  );
}
