import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import { LegalPageBody } from "@/components/marketing/legal-page-body";
import { site } from "@/lib/config/site";
import { getLegalPage } from "@/lib/services/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
};

const FALLBACK = {
  title: "Terms of Service",
  subtitle: "Last updated August 2026.",
  body: `This site is currently a frontend prototype for ${site.name}. No purchases can be completed and no payment is processed — the checkout flow is for demonstration only.

## Product Information
Product names, descriptions, and pricing shown here are illustrative placeholders and do not represent a live catalog.

## Use of This Site
You're welcome to browse and interact with every feature to evaluate the experience. Please don't submit real personal or payment information through any form on this prototype.

## Contact
Questions about these terms? Reach us at ${site.contactEmail}.`,
};

export default async function TermsPage() {
  const content = (await getLegalPage("terms")) ?? FALLBACK;

  return (
    <StaticPage title={content.title} subtitle={content.subtitle}>
      <LegalPageBody body={content.body} />
    </StaticPage>
  );
}
