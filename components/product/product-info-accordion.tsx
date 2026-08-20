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
    </Accordion>
  );
}
