import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminOfferPopupRow = Database["public"]["Tables"]["offer_popup"]["Row"];

export async function getOfferPopupForAdmin(admin: SupabaseClient<Database>): Promise<AdminOfferPopupRow> {
  const { data, error } = await admin.from("offer_popup").select("*").eq("id", true).single();
  if (error || !data) throw new Error(`getOfferPopupForAdmin: ${error?.message}`);
  return data;
}

export interface OfferPopupInput {
  imageUrl: string | null;
  cloudinaryPublicId: string | null;
  imageAlt: string;
  imageWidth: number | null;
  imageHeight: number | null;
  linkHref: string | null;
  displayWidthPx: number;
  isActive: boolean;
}

export async function updateOfferPopupForAdmin(
  admin: SupabaseClient<Database>,
  input: OfferPopupInput
): Promise<void> {
  const { error } = await admin
    .from("offer_popup")
    .update({
      image_url: input.imageUrl,
      cloudinary_public_id: input.cloudinaryPublicId,
      image_alt: input.imageAlt,
      image_width: input.imageWidth,
      image_height: input.imageHeight,
      link_href: input.linkHref,
      display_width_px: input.displayWidthPx,
      is_active: input.isActive,
    })
    .eq("id", true);
  if (error) throw new Error(`updateOfferPopupForAdmin: ${error.message}`);
}
