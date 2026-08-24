"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import { SIZES } from "@/types/product";
import { saveProductAction, type ProductFormState } from "@/app/admin/(protected)/products/actions";
import type { AdminProductDetail } from "@/lib/repositories/admin/products";
import { ProductImagesManager } from "@/components/admin/product-images-manager";

const SLEEVE_OPTIONS = ["Sleeveless", "3/4 Sleeve", "Full Sleeve", '18" Sleeve'] as const;

const INITIAL_STATE: ProductFormState = {};

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Same checkbox semantics as a plain input group — visually a chip via has-[:checked], nothing structural changes. */
function ChipCheckbox({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground transition-colors has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background hover:border-foreground/40">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="sr-only" />
      {label}
    </label>
  );
}

function CheckboxGroup({
  name,
  options,
  defaultValues,
}: {
  name: string;
  options: readonly string[];
  defaultValues: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <ChipCheckbox key={option} name={name} value={option} label={option} defaultChecked={defaultValues.includes(option)} />
      ))}
    </div>
  );
}

export function ProductForm({
  product,
  collections,
}: {
  product?: AdminProductDetail;
  collections: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveProductAction, INITIAL_STATE);

  useEffect(() => {
    if (state.productId && !product) {
      router.push(`/admin/products/${state.productId}`);
    }
  }, [state.productId, product, router]);

  return (
    // Images live outside this <form> — ProductImagesManager renders its own
    // upload form, and nested <form> elements are invalid HTML (the browser
    // silently reparents them, breaking submission).
    <div className="flex max-w-3xl flex-col gap-5">
      <form action={action} className="flex flex-col gap-5">
        {product && <input type="hidden" name="id" value={product.id} />}

        <AdminCard title="Basics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input name="name" defaultValue={product?.name} required />
            </Field>
            <Field label="Slug" hint="Leave blank to auto-generate from name">
              <Input name="slug" defaultValue={product?.slug} placeholder="auto-generated-from-name" />
            </Field>
            <Field label="Category">
              <Input name="category" defaultValue={product?.category} required />
            </Field>
            <Field label="Sort Order">
              <Input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} />
            </Field>
            <Field label="Price (₹)">
              <Input name="price" type="number" min="0" step="0.01" defaultValue={product?.price} required />
            </Field>
            <Field label="Compare-at Price (₹)" hint="Optional — shows as a strikethrough price">
              <Input
                name="compareAtPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product?.compareAtPrice ?? ""}
              />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Description">
          <div className="flex flex-col gap-4">
            <Field label="Short Description">
              <textarea name="shortDescription" defaultValue={product?.shortDescription} rows={2} className={TEXTAREA_CLASS} />
            </Field>
            <Field label="Full Description">
              <textarea name="description" defaultValue={product?.description} rows={5} className={TEXTAREA_CLASS} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Fabric & Care">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Fabric">
                <Input name="fabric" defaultValue={product?.fabric} />
              </Field>
              <Field label="Shipping Info">
                <Input name="shippingInfo" defaultValue={product?.shippingInfo} />
              </Field>
              <Field label="Fit Notes">
                <Input name="fitNotes" defaultValue={product?.fitNotes} />
              </Field>
              <Field label="Tags" hint="Comma-separated">
                <Input name="tags" defaultValue={product?.tags.join(", ")} />
              </Field>
            </div>
            <Field label="Wash Care" hint="One instruction per line">
              <textarea name="washCare" defaultValue={product?.washCare.join("\n")} rows={3} className={TEXTAREA_CLASS} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Variants">
          <div className="flex flex-col gap-5">
            <Field label="Sizes">
              <CheckboxGroup name="sizes" options={SIZES} defaultValues={product?.sizes ?? []} />
            </Field>
            <Field label="Sleeve Options" hint="Leave all unchecked if not applicable">
              <CheckboxGroup name="sleeveOptions" options={SLEEVE_OPTIONS} defaultValues={product?.sleeveOptions ?? []} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Organization">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Stock Quantity" hint="Tracked separately from the Sold Out flag below">
                <Input name="stockQuantity" type="number" min="0" defaultValue={product?.stockQuantity ?? 0} />
              </Field>
              <Field label="Low Stock Threshold" hint="Flag as “Low Stock” at or below this count">
                <Input name="lowStockThreshold" type="number" min="0" defaultValue={product?.lowStockThreshold ?? 5} />
              </Field>
            </div>

            <Field label="Collections">
              <div className="flex flex-wrap gap-2">
                {collections.map((c) => (
                  <ChipCheckbox
                    key={c.id}
                    name="collectionIds"
                    value={c.id}
                    label={c.name}
                    defaultChecked={Boolean(product?.collectionIds.includes(c.id))}
                  />
                ))}
              </div>
            </Field>

            <Field label="Flags">
              <div className="flex flex-col gap-2.5">
                {(
                  [
                    ["isNew", "New", product?.isNew],
                    ["isBestSeller", "Best Seller", product?.isBestSeller],
                    ["isSoldOut", "Sold Out", product?.isSoldOut],
                    ["isActive", "Active — visible on storefront", product?.isActive ?? true],
                    ["customSizeEnabled", "Supports custom sizing", product?.customSizeEnabled],
                  ] as const
                ).map(([name, label, checked]) => (
                  <label key={name} className="flex items-center gap-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name={name}
                      defaultChecked={Boolean(checked)}
                      className="size-4 rounded border-input accent-foreground"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </AdminCard>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        <div className="sticky bottom-4 flex justify-end">
          <Button type="submit" disabled={pending} size="lg" className="shadow-[var(--shadow-elevated)]">
            {pending ? "Saving…" : "Save Product"}
          </Button>
        </div>
      </form>

      {product && <ProductImagesManager productId={product.id} images={product.images} />}
    </div>
  );
}
