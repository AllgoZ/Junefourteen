import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

/**
 * Configures the SDK on first use rather than at module load. Module-level
 * config would read process.env before it's populated when this file is
 * imported from a standalone script (env vars are loaded after static
 * imports resolve, per ES module evaluation order) — lazy config works
 * correctly there and is a no-op difference inside the Next.js app itself.
 */
function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export interface UploadedImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Uploads a single image buffer under `junefourteen/<folder>`. Pass
 * `publicId` for a deterministic, overwrite-on-reupload asset (used by the
 * seed script so re-running it doesn't accumulate duplicate uploads);
 * omit it to let Cloudinary generate a random id (typical admin uploads).
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string,
  options?: { publicId?: string }
): Promise<UploadedImage> {
  ensureConfigured();
  const result = await new Promise<{ public_id: string; secure_url: string; width: number; height: number }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `junefourteen/${folder}`,
          ...(options?.publicId
            ? { public_id: options.publicId, overwrite: true }
            : {}),
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
          else resolve(result);
        }
      );
      stream.end(buffer);
    }
  );

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
