import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about ${site.name} orders, sizing, and shipping.`,
};

const FAQS = [
  {
    question: "How do I choose between standard and custom sizing?",
    answer:
      "Standard sizes (XS–XXL) follow our size chart, available from the Size Guide link on any product page. If you'd like a piece tailored to your exact measurements, select Custom Size on the product page and fill in the measurement form.",
  },
  {
    question: "How accurate is custom sizing?",
    answer:
      "Custom pieces are cut to the measurements you provide, so accuracy depends on how they're taken. Use the \"How to measure?\" guide on the custom size form for step-by-step instructions, and measure over close-fitting clothing for the best result.",
  },
  {
    question: "Can I return a custom-size order?",
    answer:
      "Custom and made-to-order pieces are cut specifically for you and are final sale, except in the case of a manufacturing defect. See our Returns page for details.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard-size in-stock items ship within 2–4 business days and arrive in 3–8 business days depending on your location. Custom and made-to-order pieces ship within 7–10 business days.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We ship internationally on request — reach out to us via the Contact page with your destination and we'll confirm rates and timelines.",
  },
  {
    question: "How do I care for handloom pieces?",
    answer:
      "Most handloom pieces are best dry cleaned for the first two washes, then hand washed in cold water and dried flat in shade. Full care instructions are listed on each product page.",
  },
];

export default function FaqPage() {
  return (
    <StaticPage title="FAQs" subtitle="Answers to what we're asked most.">
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((faq, i) => (
          <AccordionItem key={faq.question} value={`faq-${i}`}>
            <AccordionTrigger className="text-foreground">{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </StaticPage>
  );
}
