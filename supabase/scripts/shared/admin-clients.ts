/**
 * Script-local duplicates of lib/supabase/admin.ts and lib/cloudinary/admin.ts
 * without the `server-only` guard. That guard only works via Next.js's
 * bundler-level aliasing (it unconditionally throws under plain Node), so
 * standalone CLI scripts under supabase/ can't import the app's real admin
 * modules directly. This file exists so app code stays properly guarded
 * while scripts (seed, migrations, admin bootstrap) get the same clients.
 */
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import type { Database } from "../../../lib/supabase/types";

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

let cloudinaryConfigured = false;
function ensureCloudinaryConfigured() {
  if (cloudinaryConfigured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  cloudinaryConfigured = true;
}

export interface UploadedImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
}

export async function uploadImage(
  buffer: Buffer,
  folder: string,
  options?: { publicId?: string }
): Promise<UploadedImage> {
  ensureCloudinaryConfigured();
  const result = await new Promise<{ public_id: string; secure_url: string; width: number; height: number }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `junefourteen/${folder}`,
          ...(options?.publicId ? { public_id: options.publicId, overwrite: true } : {}),
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
          else resolve(result);
        }
      );
      stream.end(buffer);
    }
  );

  return { publicId: result.public_id, url: result.secure_url, width: result.width, height: result.height };
}
