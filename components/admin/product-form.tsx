"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { ImagePlus, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import cloudinaryLoader from "@/lib/cloudinary/loader";
import { SIZES } from "@/types/product";
import { saveProductAction, type ProductFormState } from "@/app/admin/(protected)/products/actions";
import type { AdminProductDetail } from "@/lib/repositories/admin/products";
import { ProductImagesManager } from "@/components/admin/product-images-manager";

interface PieceRow {
  id?: string;
  name: string;
  price: string;
  defaultSelected: boolean;
}

/**
 * Repeatable "Pieces" editor. Empty ⇒ a normal single-price product. When
 * rows exist, the storefront hides the single price and the customer ticks a
 * subset (≥1); the price shown is the sum of the ticked pieces. Serialised to
 * a hidden JSON input the way SocialLinksForm does.
 */
function PiecesField({ initial }: { initial: PieceRow[] }) {
  const [rows, setRows] = useState<PieceRow[]>(initial);

  const update = (index: number, patch: Partial<PieceRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const serialised = JSON.stringify(
    rows
      .filter((r) => r.name.trim())
      .map((r) => ({
        id: r.id,
        name: r.name.trim(),
        price: Number(r.price) || 0,
        defaultSelected: r.defaultSelected,
      }))
  );

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="pieces" value={serialised} />
      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Leave empty for a normal single-price product. Add pieces (e.g. Top, Bottom, Dupatta) for a set —
          the price shown becomes the total of the ticked pieces.
        </p>
      )}
      {rows.map((row, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2">
          <Input
            aria-label="Piece name"
            placeholder="Top"
            value={row.name}
            onChange={(e) => update(index, { name: e.target.value })}
            className="w-40"
          />
          <Input
            aria-label="Piece price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={row.price}
            onChange={(e) => update(index, { price: e.target.value })}
            className="w-32"
          />
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={row.defaultSelected}
              onChange={(e) => update(index, { defaultSelected: e.target.checked })}
              className="size-4 rounded border-input accent-foreground"
            />
            Ticked by default
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Remove piece"
            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            className="hover:text-destructive"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((prev) => [...prev, { name: "", price: "", defaultSelected: true }])}
        className="self-start"
      >
        <Plus className="size-4" /> Add piece
      </Button>
    </div>
  );
}

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
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (state.productId) {
      toast.success("Product saved.");
      router.push("/admin/products");
    }
  }, [state.productId, router]);

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

        <AdminCard title="Pieces & Pricing" description="For sets sold piece by piece (Top / Bottom / Dupatta). Size stays a separate choice.">
          <PiecesField
            initial={(product?.pieces ?? []).map((p) => ({
              id: p.id,
              name: p.name,
              price: String(p.price),
              defaultSelected: p.defaultSelected,
            }))}
          />
        </AdminCard>

        <AdminCard title="Size Chart" description="Shown in the product's “Size Guide” popup instead of the generic table when set.">
          <div className="flex flex-col gap-4">
            {product?.sizeChartImageUrl && (
              <div className="relative w-40 overflow-hidden rounded-lg border border-border">
                <Image
                  loader={cloudinaryLoader}
                  src={product.sizeChartImageUrl}
                  alt={product.sizeChartImageAlt ?? ""}
                  width={320}
                  height={440}
                  sizes="160px"
                  className="h-auto w-full"
                />
              </div>
            )}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border p-4">
              <ImagePlus className="mb-1.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" strokeWidth={1.5} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="product-size-chart">
                  {product?.sizeChartImageUrl ? "Replace image" : "Image"}
                </Label>
                <input id="product-size-chart" name="sizeChartImage" type="file" accept="image/*" className="text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="product-size-chart-alt">Alt Text</Label>
                <Input
                  id="product-size-chart-alt"
                  name="sizeChartImageAlt"
                  defaultValue={product?.sizeChartImageAlt ?? ""}
                  className="w-56"
                />
              </div>
            </div>
            {product?.sizeChartImageUrl && (
              <label className="flex items-center gap-2.5 text-sm text-foreground">
                <input
                  type="checkbox"
                  name="removeSizeChartImage"
                  className="size-4 rounded border-input accent-foreground"
                />
                Remove current image (reverts to the generic size table)
              </label>
            )}
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

        <div className="sticky bottom-4 flex flex-col items-end gap-1.5">
          <Button type="submit" disabled={pending || imageUploading} size="lg" className="shadow-[var(--shadow-elevated)]">
            {pending ? "Saving…" : imageUploading ? "Waiting for image upload…" : "Save Product"}
          </Button>
          {imageUploading && (
            <p className="rounded-md bg-card px-2 py-1 text-xs text-muted-foreground shadow-[var(--shadow-subtle)]">
              Image uploading — please wait before saving.
            </p>
          )}
        </div>
      </form>

      {product && (
        <ProductImagesManager productId={product.id} images={product.images} onUploadingChange={setImageUploading} />
      )}
    </div>
  );
}
