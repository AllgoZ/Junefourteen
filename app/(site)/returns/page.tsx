import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Returns",
  description: `Returns, exchanges, and refund policy for ${site.name} orders.`,
};

export default function ReturnsPage() {
  return (
    <StaticPage title="Returns" subtitle="Easy returns on standard-size pieces.">
      <div>
        <h2>Standard-Size Items</h2>
        <p className="mt-2">
          We accept returns within 7 days of delivery on unworn, unwashed pieces with tags intact.
          Refunds are issued to your original payment method within 5–7 business days of us
          receiving the item.
        </p>
      </div>
      <div>
        <h2>Custom-Size &amp; Made-to-Order Items</h2>
        <p className="mt-2">
          Because these pieces are cut to your measurements, they are final sale and not eligible
          for return or exchange, except in the case of a manufacturing defect.
        </p>
      </div>
      <div>
        <h2>Exchanges</h2>
        <p className="mt-2">
          Need a different size? Start a return for a refund and place a new order — this is the
          fastest way to get the right fit while stock lasts.
        </p>
      </div>
      <div>
        <h2>Damaged or Incorrect Items</h2>
        <p className="mt-2">
          If something arrives damaged or incorrect, contact us within 48 hours of delivery with
          photos and we&rsquo;ll make it right at no cost to you.
        </p>
      </div>
    </StaticPage>
  );
}
