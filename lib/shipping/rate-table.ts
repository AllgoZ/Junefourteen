/**
 * Mock shipping rules. Real shipping-provider integration is explicitly out
 * of scope (backend brief §13/§22) — this module exists so that future work
 * is confined to here (and lib/services/shipping.ts's implementation),
 * never to the checkout UI that calls getShippingEstimate().
 */
export const REMOTE_STATES = new Set([
  "Andaman and Nicobar Islands",
  "Lakshadweep",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
]);

export const RATE_BY_STATE: Record<string, number> = {
  "Tamil Nadu": 100,
};

export const DEFAULT_INDIA_RATE = 120;
export const REMOTE_RATE = 150;
export const INTERNATIONAL_RATE = 1500;
