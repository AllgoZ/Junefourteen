import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AdminCollectionRow = Database["public"]["Tables"]["collections"]["Row"];

export async function listAllCollectionsForAdmin(admin: SupabaseClient<Database>): Promise<AdminCollectionRow[]> {
  const { data, error } = await admin.from("collections").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(`listAllCollectionsForAdmin: ${error.message}`);
  return data;
}

export async function getCollectionForAdmin(
  admin: SupabaseClient<Database>,
  id: string
): Promise<AdminCollectionRow | null> {
  const { data, error } = await admin.from("collections").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getCollectionForAdmin: ${error.message}`);
  return data;
}

export interface CollectionFormInput {
  slug: string;
  name: string;
  description: string;
  tone: number;
  imageUrl: string | null;
  imageAlt: string;
  cloudinaryPublicId: string | null;
  sortOrder: number;
  isActive: boolean;
}

function toCollectionColumns(input: CollectionFormInput) {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    tone: input.tone,
    image_url: input.imageUrl,
    image_alt: input.imageAlt,
    cloudinary_public_id: input.cloudinaryPublicId,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };
}

export async function createCollectionForAdmin(
  admin: SupabaseClient<Database>,
  input: CollectionFormInput
): Promise<string> {
  const { data, error } = await admin.from("collections").insert(toCollectionColumns(input)).select("id").single();
  if (error || !data) throw new Error(`createCollectionForAdmin: ${error?.message}`);
  return data.id;
}

export async function updateCollectionForAdmin(
  admin: SupabaseClient<Database>,
  id: string,
  input: CollectionFormInput
): Promise<void> {
  const { error } = await admin.from("collections").update(toCollectionColumns(input)).eq("id", id);
  if (error) throw new Error(`updateCollectionForAdmin: ${error.message}`);
}

export async function setCollectionActive(
  admin: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await admin.from("collections").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`setCollectionActive: ${error.message}`);
}
