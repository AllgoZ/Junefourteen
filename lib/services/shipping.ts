import type { ShippingEstimateInput, ShippingEstimateResult } from "@/types/shipping";
import { getShippingZones } from "@/lib/services/shipping-zones";
import {
  DEFAULT_INDIA_RATE,
  INTERNATIONAL_RATE,
  RATE_BY_STATE,
  REMOTE_RATE,
  REMOTE_STATES,
} from "@/lib/shipping/rate-table";

/**
 * Admin-managed (lib/repositories/admin/shipping.ts) — replaces the old
 * static rate table. Only ever called server-side now (see
 * estimateShippingAction in app/(site)/checkout/actions.ts) since it does
 * a real DB read; the old version was pure constants and could safely run
 * in browser-bundled client code, this one can't.
 */
export async function getShippingEstimate(input: ShippingEstimateInput): Promise<ShippingEstimateResult> {
  if (input.country.trim().toLowerCase() !== "india") {
    return {
      zoneLabel: input.country,
      amount: INTERNATIONAL_RATE,
      etaLabel: "10–18 business days",
    };
  }

  const zones = await getShippingZones();

  if (zones.length > 0) {
    const matched = zones.find((z) => z.states.includes(input.state)) ?? zones.find((z) => z.is_default) ?? zones[0];
    const freeShipping =
      matched.free_shipping_threshold != null &&
      input.orderSubtotal != null &&
      input.orderSubtotal >= matched.free_shipping_threshold;

    return {
      zoneLabel: input.state,
      amount: freeShipping ? 0 : matched.rate,
      etaLabel: `${matched.eta_min_days}–${matched.eta_max_days} business days`,
    };
  }

  // Fallback: no shipping zones configured yet (fresh install, before an
  // admin sets any up) — behave exactly like the old static rate table so
  // checkout never breaks.
  if (REMOTE_STATES.has(input.state)) {
    return { zoneLabel: `${input.state} (remote area)`, amount: REMOTE_RATE, etaLabel: "8–12 business days" };
  }
  const rate = RATE_BY_STATE[input.state] ?? DEFAULT_INDIA_RATE;
  return {
    zoneLabel: input.state,
    amount: rate,
    etaLabel: rate === RATE_BY_STATE["Tamil Nadu"] ? "3–5 business days" : "5–8 business days",
  };
}

// Re-exported for server-side callers that already import it from this path
// (e.g. app/admin/(protected)/shipping's server-rendered pages). Client
// components must import INDIAN_STATES from lib/config/indian-states.ts
// directly instead — see that file's comment for why.
export { INDIAN_STATES } from "@/lib/config/indian-states";
