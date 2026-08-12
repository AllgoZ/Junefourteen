import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Product } from "@/types/product";

export function ProductInfoAccordion({ product }: { product: Product }) {
  return (
    <Accordion type="multiple" defaultValue={["description"]}>
      <AccordionItem value="description">
        <AccordionTrigger>Description</AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">{product.description}</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fabric">
        <AccordionTrigger>Fabric &amp; Details</AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">{product.fabric}</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fit">
        <AccordionTrigger>Size &amp; Fit</AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">{product.fitNotes}</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="care">
        <AccordionTrigger>Wash Care</AccordionTrigger>
        <AccordionContent>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-muted-foreground">
            {product.washCare.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">{product.shippingInfo}</p>
          <p className="mt-2 text-muted-foreground">
            Easy returns within 7 days of delivery on standard-size, unworn pieces. See our{" "}
            <Link href="/returns">returns policy</Link>.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
