import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import { SizeGuideContent } from "@/components/product/size-guide-content";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Size Guide",
  description: `${site.name} standard size chart and measuring guide.`,
};

export default function SizeGuidePage() {
  return (
    <StaticPage title="Size Guide" subtitle="Find your standard size, or learn how to measure yourself for custom sizing.">
      <SizeGuideContent />
    </StaticPage>
  );
}
