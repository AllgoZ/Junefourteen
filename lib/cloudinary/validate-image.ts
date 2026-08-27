import "server-only";

/**
 * Independent of the global 10MB Server Action body cap (next.config.ts) —
 * that's a wire-level limit for the whole request; this is a
 * content-specific ceiling with headroom under it.
 */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Magic-byte signatures for the allowed types — checked against the actual
 * buffer, not just the client-supplied `file.type` (trivially spoofable:
 * it's metadata the browser reports, not a guarantee about the bytes).
 */
function matchesImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (PNG_SIGNATURE.every((byte, i) => buffer[i] === byte)) return true;

  // GIF: "GIF8"
  if (buffer.toString("ascii", 0, 4) === "GIF8") return true;

  // WebP: "RIFF" .... "WEBP"
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return true;

  return false;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Server-side guard for every admin image-upload Server Action, called
 * right after the existing `file instanceof File && file.size > 0` check.
 * `accept="image/*"` on the `<input>` is a client-side hint only — this is
 * the actual trust boundary before a buffer reaches Cloudinary.
 */
export function validateImageFile(file: File, buffer: Buffer): ImageValidationResult {
  if (file.size > MAX_IMAGE_BYTES) {
    return { valid: false, error: `Image is too large — please use one under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.` };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: "Unsupported file type — please upload a JPG, PNG, WebP, or GIF image." };
  }
  if (!matchesImageSignature(buffer)) {
    return { valid: false, error: "This file doesn't look like a valid image. Please try a different file." };
  }
  return { valid: true };
}
