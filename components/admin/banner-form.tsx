"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import { BannerImageField } from "@/components/admin/banner-image-field";
import { BANNER_UPLOAD_GUIDANCE } from "@/lib/config/hero-dimensions";
import { saveBannerAction, deleteBannerAction, type BannerFormState } from "@/app/admin/(protected)/banners/actions";
import type { AdminBannerRow } from "@/lib/repositories/admin/banners";

const INITIAL_STATE: BannerFormState = {};
const FORM_ID = "banner-edit-form";

function parsePosition(value: string): { x: number; y: number } {
  const match = value.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 50, y: 50 };
}

function ToggleSwitch({
  name,
  form,
  checked,
  onChange,
}: {
  name: string;
  form: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        name={name}
        form={form}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-foreground" />
      <span className="absolute left-1 size-4 rounded-full bg-background transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

export function BannerForm({ banner }: { banner?: AdminBannerRow }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveBannerAction, INITIAL_STATE);

  const initialDesktopPosition = parsePosition(banner?.desktop_object_position ?? "50% 50%");
  const initialMobilePosition = parsePosition(banner?.mobile_object_position ?? "50% 50%");
  const [desktopX, setDesktopX] = useState(initialDesktopPosition.x);
  const [desktopY, setDesktopY] = useState(initialDesktopPosition.y);
  const [mobileX, setMobileX] = useState(initialMobilePosition.x);
  const [mobileY, setMobileY] = useState(initialMobilePosition.y);

  const [desktopPreviewSrc, setDesktopPreviewSrc] = useState<string | undefined>(banner?.desktop_image_url ?? undefined);
  const [mobilePreviewSrc, setMobilePreviewSrc] = useState<string | undefined>(banner?.mobile_image_url ?? undefined);
  const [removeMobileImage, setRemoveMobileImage] = useState(false);

  const [headline, setHeadline] = useState(banner?.headline ?? "");
  const [primaryCtaHref, setPrimaryCtaHref] = useState(banner?.primary_cta_href ?? "");
  const [sortOrder, setSortOrder] = useState(banner?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(banner?.is_active ?? true);

  const desktopObjectPosition = `${desktopX}% ${desktopY}%`;
  const mobileObjectPosition = `${mobileX}% ${mobileY}%`;
  const effectiveMobileSrc = removeMobileImage ? undefined : (mobilePreviewSrc ?? desktopPreviewSrc);

  useEffect(() => {
    if (state.bannerId && !banner) {
      router.push(`/admin/banners/${state.bannerId}`);
    }
  }, [state.bannerId, banner, router]);

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-subtle)]">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{headline.trim() || "Untitled Slide"}</p>
          <p className="truncate text-xs text-muted-foreground">{primaryCtaHref.trim() || "No link set"}</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="banner-sort" className="text-xs text-muted-foreground">
              Position
            </Label>
            <Input
              id="banner-sort"
              form={FORM_ID}
              name="sortOrder"
              type="number"
              className="w-16"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            Active
            <ToggleSwitch name="isActive" form={FORM_ID} checked={isActive} onChange={setIsActive} />
          </label>
        </div>
      </div>

      <form id={FORM_ID} action={action} className="flex flex-col gap-5">
        {banner && <input type="hidden" name="id" value={banner.id} />}
        <input type="hidden" name="desktopObjectPosition" value={desktopObjectPosition} />
        <input type="hidden" name="mobileObjectPosition" value={mobileObjectPosition} />

        <AdminCard title="Content">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-badge">Badge Text</Label>
              <Input id="banner-badge" name="badgeText" defaultValue={banner?.badge_text ?? ""} placeholder="New Collection 2026" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-headline">
                Headline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="banner-headline"
                name="headline"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Comfort in Every Stitch."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-subheading">Subheading</Label>
              <textarea
                id="banner-subheading"
                name="subheading"
                defaultValue={banner?.subheading ?? ""}
                rows={2}
                placeholder="Timeless ethnic wear crafted for your little ones…"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Primary CTA">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-primary-cta-text">Primary CTA Text</Label>
              <Input id="banner-primary-cta-text" name="primaryCtaText" defaultValue={banner?.primary_cta_text ?? ""} placeholder="Shop Now" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-primary-cta-href">Primary CTA Link</Label>
              <Input
                id="banner-primary-cta-href"
                name="primaryCtaHref"
                value={primaryCtaHref}
                onChange={(e) => setPrimaryCtaHref(e.target.value)}
                placeholder="/shop"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Optional — leave blank to use the default Shop link.</p>
        </AdminCard>

        <AdminCard>
          <BannerImageField
            kind="desktop"
            label="Desktop / Laptop Image"
            recommended={BANNER_UPLOAD_GUIDANCE.desktop}
            fileFieldName="desktopImage"
            urlFieldName="desktopImageUrlInput"
            altFieldName="desktopImageAlt"
            altDefault={banner?.desktop_image_alt ?? ""}
            initialUrl={banner?.desktop_image_url ?? undefined}
            previewSrc={desktopPreviewSrc}
            objectPosition={desktopObjectPosition}
            onFileSelected={(file) => setDesktopPreviewSrc(URL.createObjectURL(file))}
            onUrlChange={(url) => setDesktopPreviewSrc(url || undefined)}
            x={desktopX}
            y={desktopY}
            setX={setDesktopX}
            setY={setDesktopY}
            idPrefix="banner-desktop"
          />
        </AdminCard>

        <AdminCard>
          <BannerImageField
            kind="mobile"
            label="Mobile Image (optional)"
            recommended={BANNER_UPLOAD_GUIDANCE.mobile}
            fileFieldName="mobileImage"
            urlFieldName="mobileImageUrlInput"
            altFieldName="mobileImageAlt"
            altDefault={banner?.mobile_image_alt ?? ""}
            initialUrl={banner?.mobile_image_url ?? undefined}
            previewSrc={effectiveMobileSrc}
            objectPosition={mobileObjectPosition}
            onFileSelected={(file) => {
              setMobilePreviewSrc(URL.createObjectURL(file));
              setRemoveMobileImage(false);
            }}
            onUrlChange={(url) => {
              setMobilePreviewSrc(url || undefined);
              if (url) setRemoveMobileImage(false);
            }}
            x={mobileX}
            y={mobileY}
            setX={setMobileX}
            setY={setMobileY}
            idPrefix="banner-mobile"
            note="Shown only on phones — the desktop/laptop image is used on phones too if this is left empty."
            extra={
              banner?.mobile_image_url ? (
                <label className="flex items-center gap-2.5 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="removeMobileImage"
                    checked={removeMobileImage}
                    onChange={(e) => setRemoveMobileImage(e.target.checked)}
                    className="size-4 rounded border-input accent-foreground"
                  />
                  Remove — use the laptop image on mobile instead
                </label>
              ) : undefined
            }
          />
        </AdminCard>

        <AdminCard title="Secondary Button & Offer Badge">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="banner-secondary-cta-text">Secondary CTA Text</Label>
                <Input
                  id="banner-secondary-cta-text"
                  name="secondaryCtaText"
                  defaultValue={banner?.secondary_cta_text ?? ""}
                  placeholder="View Collections"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="banner-secondary-cta-href">Secondary CTA Link</Label>
                <Input
                  id="banner-secondary-cta-href"
                  name="secondaryCtaHref"
                  defaultValue={banner?.secondary_cta_href ?? ""}
                  placeholder="/collections"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-offer-badge">Offer Badge Text</Label>
              <Input
                id="banner-offer-badge"
                name="offerBadgeText"
                defaultValue={banner?.offer_badge_text ?? ""}
                placeholder="₹300 OFF on orders above ₹2500"
              />
            </div>
          </div>
        </AdminCard>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </form>

      <div className="flex items-center justify-between">
        {banner ? (
          <form
            action={deleteBannerAction}
            onSubmit={(e) => {
              if (!confirm("Delete this banner? This can't be undone.")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={banner.id} />
            <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete
            </Button>
          </form>
        ) : (
          <span />
        )}
        <Button type="submit" form={FORM_ID} disabled={pending} size="lg" className="shadow-[var(--shadow-elevated)]">
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
