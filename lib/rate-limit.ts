import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * `x-forwarded-for` is set by the hosting platform's edge (Vercel and most
 * other Next hosts) and may carry a comma-separated chain — the first
 * entry is the original client. Falls back to a single shared bucket in
 * local dev (no proxy in front of `next dev` sets this header), which
 * means local testing rate-limits "everyone" together — acceptable since
 * this only matters for the real, multi-client production case.
 */
export async function getClientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export interface RateLimitOptions {
  /** Max hits allowed inside the window. */
  max: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/** Upper bound across every bucket in this app — safe to hard-delete anything older, regardless of that bucket's own window. */
const MAX_RETENTION_MS = 60 * 60 * 1000;

/**
 * Postgres-backed fixed-window rate limiter (rate_limit_hits table,
 * migration 0015) — chosen over an in-memory counter because this app has
 * no single long-lived process to hold one safely (proxy.ts/Server Actions
 * can run on any instance), and over a new external service (Redis/
 * Upstash) since Postgres is already reachable everywhere via the admin
 * client. `bucket` scopes independent limits (e.g. "sign-in", "coupon"),
 * `identifier` scopes per-caller (IP, email, or a composite).
 *
 * Fails **open**: any error talking to the DB allows the request through
 * rather than blocking a legitimate user on infrastructure trouble.
 */
export async function checkRateLimit(
  bucket: string,
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `${bucket}:${identifier}`;
  const windowStartIso = new Date(Date.now() - options.windowSeconds * 1000).toISOString();

  try {
    const admin = createAdminClient();

    const { count, error } = await admin
      .from("rate_limit_hits")
      .select("*", { count: "exact", head: true })
      .eq("key", key)
      .gte("created_at", windowStartIso);

    if (error) return { allowed: true };
    if ((count ?? 0) >= options.max) {
      return { allowed: false, retryAfterSeconds: options.windowSeconds };
    }

    await admin.from("rate_limit_hits").insert({ key });

    // Opportunistic, low-frequency cleanup — no cron needed at this scale,
    // and never something the caller needs to wait extra on if it fails.
    if (Math.random() < 0.05) {
      await admin
        .from("rate_limit_hits")
        .delete()
        .lt("created_at", new Date(Date.now() - MAX_RETENTION_MS).toISOString())
        .then(
          () => undefined,
          () => undefined
        );
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
