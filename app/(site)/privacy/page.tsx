import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import { LegalPageBody } from "@/components/marketing/legal-page-body";
import { site } from "@/lib/config/site";
import { getLegalPage } from "@/lib/services/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const FALLBACK = {
  title: "Privacy Policy",
  subtitle: "Last updated August 2026.",
  body: `This is a prototype storefront. No real customer accounts, payments, or orders are processed on this site yet — any information entered into forms here (newsletter, contact, checkout) is not transmitted or stored beyond your own browser session.

## What We Store Locally
To demonstrate cart, wishlist, and recent-search functionality, this prototype stores data in your browser's local storage only. It never leaves your device and is cleared if you clear your browser data.

## Future Data Handling
When ${site.name} launches with a real backend, this policy will be updated to describe what account, order, and payment data we collect and how it's used.

## Contact
Questions? Reach us at ${site.contactEmail}.`,
};

export default async function PrivacyPage() {
  const content = (await getLegalPage("privacy")) ?? FALLBACK;

  return (
    <StaticPage title={content.title} subtitle={content.subtitle}>
      <LegalPageBody body={content.body} />
    </StaticPage>
  );
}
