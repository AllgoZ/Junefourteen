import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Shipping",
  description: `Shipping rates, timelines, and coverage for ${site.name} orders.`,
};

export default function ShippingPage() {
  return (
    <StaticPage title="Shipping" subtitle="Where we ship, how long it takes, and what it costs.">
      <div>
        <h2>Domestic Shipping (India)</h2>
        <p className="mt-2">
          Orders are dispatched within 2–4 business days. Made-to-order and custom-size pieces are
          cut only after your measurements are confirmed and ship within 7–10 business days.
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          <li>Tamil Nadu — ₹100, 3–5 business days</li>
          <li>Rest of India — ₹120, 5–8 business days</li>
          <li>Remote areas — ₹150, 8–12 business days</li>
        </ul>
      </div>
      <div>
        <h2>International Shipping</h2>
        <p className="mt-2">
          We currently ship internationally on request. Rates and timelines vary by destination —
          use the shipping estimator in your bag, or reach out to us directly.
        </p>
      </div>
      <div>
        <h2>Order Tracking</h2>
        <p className="mt-2">
          You&rsquo;ll receive a tracking link by email once your order ships. Order tracking
          inside your account is launching soon.
        </p>
      </div>
    </StaticPage>
  );
}
