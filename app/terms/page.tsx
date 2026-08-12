import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Service" subtitle="Last updated August 2026.">
      <p>
        This site is currently a frontend prototype for {site.name}. No purchases can be
        completed and no payment is processed — the checkout flow is for demonstration only.
      </p>
      <div>
        <h2>Product Information</h2>
        <p className="mt-2">
          Product names, descriptions, and pricing shown here are illustrative placeholders and
          do not represent a live catalog.
        </p>
      </div>
      <div>
        <h2>Use of This Site</h2>
        <p className="mt-2">
          You&rsquo;re welcome to browse and interact with every feature to evaluate the
          experience. Please don&rsquo;t submit real personal or payment information through any
          form on this prototype.
        </p>
      </div>
      <div>
        <h2>Contact</h2>
        <p className="mt-2">Questions about these terms? Reach us at {site.contactEmail}.</p>
      </div>
    </StaticPage>
  );
}
