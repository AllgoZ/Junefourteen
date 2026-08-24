import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" subtitle="Last updated August 2026.">
      <p>
        This is a prototype storefront. No real customer accounts, payments, or orders are
        processed on this site yet — any information entered into forms here (newsletter,
        contact, checkout) is not transmitted or stored beyond your own browser session.
      </p>
      <div>
        <h2>What We Store Locally</h2>
        <p className="mt-2">
          To demonstrate cart, wishlist, and recent-search functionality, this prototype stores
          data in your browser&rsquo;s local storage only. It never leaves your device and is
          cleared if you clear your browser data.
        </p>
      </div>
      <div>
        <h2>Future Data Handling</h2>
        <p className="mt-2">
          When {site.name} launches with a real backend, this policy will be updated to describe what
          account, order, and payment data we collect and how it&rsquo;s used.
        </p>
      </div>
      <div>
        <h2>Contact</h2>
        <p className="mt-2">Questions? Reach us at {site.contactEmail}.</p>
      </div>
    </StaticPage>
  );
}
