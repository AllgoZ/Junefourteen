import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminBannerRow = Database["public"]["Tables"]["banners"]["Row"];

export async function listAllBannersForAdmin(admin: SupabaseClient<Database>): Promise<AdminBannerRow[]> {
  const { data, error } = await admin.from("banners").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(`listAllBannersForAdmin: ${error.message}`);
  return data;
}

export async function getBannerForAdmin(
  admin: SupabaseClient<Database>,
  id: string
): Promise<AdminBannerRow | null> {
  const { data, error } = await admin.from("banners").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getBannerForAdmin: ${error.message}`);
  return data;
}

export interface BannerFormInput {
  desktopImageUrl: string;
  desktopImageAlt: string;
  desktopCloudinaryPublicId: string | null;
  desktopObjectPosition: string;
  mobileImageUrl: string | null;
  mobileImageAlt: string;
  mobileCloudinaryPublicId: string | null;
  mobileObjectPosition: string;
  tone: number;
  badgeText: string | null;
  headline: string;
  subheading: string | null;
  primaryCtaText: string | null;
  primaryCtaHref: string | null;
  secondaryCtaText: string | null;
  secondaryCtaHref: string | null;
  offerBadgeText: string | null;
  sortOrder: number;
  isActive: boolean;
}

function toBannerColumns(input: BannerFormInput) {
  return {
    desktop_image_url: input.desktopImageUrl,
    desktop_image_alt: input.desktopImageAlt,
    desktop_cloudinary_public_id: input.desktopCloudinaryPublicId,
    desktop_object_position: input.desktopObjectPosition,
    mobile_image_url: input.mobileImageUrl,
    mobile_image_alt: input.mobileImageAlt,
    mobile_cloudinary_public_id: input.mobileCloudinaryPublicId,
    mobile_object_position: input.mobileObjectPosition,
    tone: input.tone,
    badge_text: input.badgeText,
    headline: input.headline,
    subheading: input.subheading,
    primary_cta_text: input.primaryCtaText,
    primary_cta_href: input.primaryCtaHref,
    secondary_cta_text: input.secondaryCtaText,
    secondary_cta_href: input.secondaryCtaHref,
    offer_badge_text: input.offerBadgeText,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };
}

export async function createBannerForAdmin(
  admin: SupabaseClient<Database>,
  input: BannerFormInput
): Promise<string> {
  const { data, error } = await admin.from("banners").insert(toBannerColumns(input)).select("id").single();
  if (error || !data) throw new Error(`createBannerForAdmin: ${error?.message}`);
  return data.id;
}

export async function updateBannerForAdmin(
  admin: SupabaseClient<Database>,
  id: string,
  input: BannerFormInput
): Promise<void> {
  const { error } = await admin.from("banners").update(toBannerColumns(input)).eq("id", id);
  if (error) throw new Error(`updateBannerForAdmin: ${error.message}`);
}

export async function setBannerActive(
  admin: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await admin.from("banners").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`setBannerActive: ${error.message}`);
}

/**
 * A genuine hard delete — unlike products/collections, nothing else
 * references a banner row (no order history, no FK from any other table),
 * so the usual soft-delete-only convention doesn't apply here. Cloudinary
 * cleanup is the caller's job (see deleteBannerAction), since this
 * repository layer doesn't own the Cloudinary client.
 */
export async function deleteBannerForAdmin(admin: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await admin.from("banners").delete().eq("id", id);
  if (error) throw new Error(`deleteBannerForAdmin: ${error.message}`);
}
