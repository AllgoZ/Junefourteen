"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SizeSelector } from "@/components/product/size-selector";
import { CustomSizeForm } from "@/components/product/custom-size-form";
import { SizeGuideModal } from "@/components/product/size-guide-modal";
import type { CustomMeasurements, Product, Size } from "@/types/product";
import type { SelectionErrors } from "@/lib/validation";

interface SizeAndFitProps {
  product: Product;
  sizeMode: "standard" | "custom";
  onSizeModeChange: (mode: "standard" | "custom") => void;
  size?: Size;
  onSizeChange: (size: Size) => void;
  customMeasurements: Partial<CustomMeasurements>;
  onCustomMeasurementsChange: (m: Partial<CustomMeasurements>) => void;
  errors: SelectionErrors;
}

export function SizeAndFit({
  product,
  sizeMode,
  onSizeModeChange,
  size,
  onSizeChange,
  customMeasurements,
  onCustomMeasurementsChange,
  errors,
}: SizeAndFitProps) {
  if (!product.supportsCustomSize) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Size</p>
          <SizeGuideModal />
        </div>
        <SizeSelector sizes={product.sizes} value={size} onChange={onSizeChange} error={errors.size} />
      </div>
    );
  }

  return (
    <div>
      <Tabs value={sizeMode} onValueChange={(v) => onSizeModeChange(v as "standard" | "custom")}>
        <div className="mb-3 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="standard">Standard Size</TabsTrigger>
            <TabsTrigger value="custom">Custom Size</TabsTrigger>
          </TabsList>
          {sizeMode === "standard" && <SizeGuideModal />}
        </div>

        <TabsContent value="standard">
          <SizeSelector sizes={product.sizes} value={size} onChange={onSizeChange} error={errors.size} />
        </TabsContent>
        <TabsContent value="custom">
          <CustomSizeForm
            value={customMeasurements}
            onChange={onCustomMeasurementsChange}
            errors={errors.measurements}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
