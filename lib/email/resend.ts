import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

/**
 * Lazily constructed, same reasoning as lib/cloudinary/admin.ts's
 * ensureConfigured / lib/payments/razorpay.ts's getClient — reads
 * process.env on first use, not at module load.
 */
function getClient(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

/**
 * Falls back to Resend's own unverified-domain sandbox sender. That sender
 * can't reliably deliver to arbitrary recipients — set RESEND_FROM_EMAIL to
 * an address on a domain verified in the Resend dashboard once one exists
 * (see ARCHITECTURE.md's email section).
 */
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "JUNEFOURTEEN <onboarding@resend.dev>";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Never throws — a transactional email failing to send must never break the
 * checkout/admin action that triggered it, same "best-effort" discipline
 * already used elsewhere in this codebase (e.g. checkout's address-save).
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  try {
    const { error } = await getClient().emails.send({ from: FROM_EMAIL, ...input });
    if (error) {
      console.error("sendEmail failed", { to: input.to, subject: input.subject, error });
    }
  } catch (err) {
    console.error("sendEmail threw", { to: input.to, subject: input.subject, err });
  }
}
