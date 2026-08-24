import { createAnonClient } from "@/lib/supabase/anon";

export interface CollectionRow {
  slug: string;
  name: string;
  description: string;
  tone: number;
  image_url: string | null;
}

const COLLECTION_SELECT = "slug, name, description, tone, image_url";

export async function listActiveCollections(): Promise<CollectionRow[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("collections")
    .select(COLLECTION_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .overrideTypes<CollectionRow[], { merge: false }>();

  if (error) throw new Error(`listActiveCollections: ${error.message}`);
  return data;
}

export async function getActiveCollectionBySlug(slug: string): Promise<CollectionRow | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("collections")
    .select(COLLECTION_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
    .overrideTypes<CollectionRow, { merge: false }>();

  if (error) throw new Error(`getActiveCollectionBySlug: ${error.message}`);
  return data;
}
