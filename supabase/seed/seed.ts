/**
 * Seeds Supabase from the existing mock catalog (lib/mock-data), uploading
 * the 6 real dummy photos to Cloudinary along the way. Imports the actual
 * mock-data modules (not a hand-copied transcription) so the deterministic
 * slug-hash image rotation in lib/mock-data/products.ts#images() is
 * reproduced exactly — seeded product_images match today's visual output.
 *
 * Safe to re-run: collections/products upsert on slug, child rows
 * (product_collections/sizes/sleeves/images) are deleted and reinserted per
 * product, and gallery uploads reuse a deterministic Cloudinary public_id
 * (overwrite, not duplicate).
 *
 * Usage: npx tsx supabase/seed/seed.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { products } from "../../lib/mock-data/products";
import { collections as mockCollections } from "../../lib/mock-data/collections";
import { GALLERY_IMAGES } from "../../lib/mock-data/gallery-images";
import { createAdminClient, uploadImage, type UploadedImage } from "../scripts/shared/admin-clients";

process.loadEnvFile(".env.local");

async function main() {
  const supabase = createAdminClient();

  console.log("Uploading gallery images to Cloudinary...");
  const imageMap = new Map<string, UploadedImage>();
  for (const localPath of GALLERY_IMAGES) {
    const filename = localPath.split("/").pop()!.replace(/\.\w+$/, "");
    const buffer = readFileSync(join(process.cwd(), "public", localPath));
    const uploaded = await uploadImage(buffer, "gallery", { publicId: filename });
    imageMap.set(localPath, uploaded);
    console.log(`  ${localPath} -> ${uploaded.url}`);
  }

  console.log("Seeding collections...");
  const collectionIdBySlug = new Map<string, string>();
  for (const [index, c] of mockCollections.entries()) {
    const img = c.imageSrc ? imageMap.get(c.imageSrc) : undefined;
    const { data, error } = await supabase
      .from("collections")
      .upsert(
        {
          slug: c.slug,
          name: c.name,
          description: c.description,
          tone: c.tone,
          image_url: img?.url ?? null,
          image_alt: c.name,
          cloudinary_public_id: img?.publicId ?? null,
          sort_order: index,
          is_active: true,
        },
        { onConflict: "slug" }
      )
      .select("id, slug")
      .single();
    if (error || !data) throw new Error(`collection ${c.slug}: ${error?.message}`);
    collectionIdBySlug.set(data.slug, data.id);
  }

  console.log("Seeding products...");
  const productIdBySlug = new Map<string, string>();
  for (const [index, p] of products.entries()) {
    const { data, error } = await supabase
      .from("products")
      .upsert(
        {
          slug: p.slug,
          name: p.name,
          description: p.description,
          short_description: p.shortDescription,
          price: p.price,
          compare_at_price: p.compareAtPrice ?? null,
          category: p.category,
          tags: p.tags,
          is_new: Boolean(p.isNew),
          is_best_seller: Boolean(p.isBestSeller),
          is_sold_out: Boolean(p.isSoldOut),
          is_active: true,
          custom_size_enabled: Boolean(p.supportsCustomSize),
          fabric: p.fabric,
          wash_care: p.washCare,
          shipping_info: p.shippingInfo,
          fit_notes: p.fitNotes,
          sort_order: index,
        },
        { onConflict: "slug" }
      )
      .select("id, slug")
      .single();
    if (error || !data) throw new Error(`product ${p.slug}: ${error?.message}`);
    productIdBySlug.set(data.slug, data.id);
  }

  console.log("Seeding product relations (collections, sizes, sleeves, images)...");
  for (const p of products) {
    const productId = productIdBySlug.get(p.slug)!;

    await supabase.from("product_collections").delete().eq("product_id", productId);
    const collectionRows = p.collectionSlugs.flatMap((slug, index) => {
      const collectionId = collectionIdBySlug.get(slug);
      if (!collectionId) {
        console.warn(`  ! product ${p.slug} references unknown collection ${slug}`);
        return [];
      }
      return [{ product_id: productId, collection_id: collectionId, sort_order: index }];
    });
    if (collectionRows.length) {
      const { error } = await supabase.from("product_collections").insert(collectionRows);
      if (error) throw new Error(`product_collections for ${p.slug}: ${error.message}`);
    }

    await supabase.from("product_sizes").delete().eq("product_id", productId);
    const sizeRows = p.sizes.map((size, index) => ({ product_id: productId, size, sort_order: index }));
    if (sizeRows.length) {
      const { error } = await supabase.from("product_sizes").insert(sizeRows);
      if (error) throw new Error(`product_sizes for ${p.slug}: ${error.message}`);
    }

    await supabase.from("product_sleeve_options").delete().eq("product_id", productId);
    const sleeveRows = (p.sleeveOptions ?? []).map((sleeve_option, index) => ({
      product_id: productId,
      sleeve_option,
      sort_order: index,
    }));
    if (sleeveRows.length) {
      const { error } = await supabase.from("product_sleeve_options").insert(sleeveRows);
      if (error) throw new Error(`product_sleeve_options for ${p.slug}: ${error.message}`);
    }

    await supabase.from("product_images").delete().eq("product_id", productId);
    const imageRows = p.images.map((image, index) => {
      const uploaded = image.src ? imageMap.get(image.src) : undefined;
      if (!uploaded) {
        throw new Error(
          `product ${p.slug} image #${index} has no matching uploaded gallery asset (src=${image.src})`
        );
      }
      return {
        product_id: productId,
        cloudinary_public_id: uploaded.publicId,
        image_url: uploaded.url,
        alt: image.alt || p.name,
        tone: image.tone,
        width: uploaded.width,
        height: uploaded.height,
        sort_order: index,
      };
    });
    const { error } = await supabase.from("product_images").insert(imageRows);
    if (error) throw new Error(`product_images for ${p.slug}: ${error.message}`);
  }

  console.log(`Seeded ${mockCollections.length} collections and ${products.length} products.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
