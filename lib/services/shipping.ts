import type { ShippingEstimateInput, ShippingEstimateResult } from "@/types/shipping";

/**
 * Mock shipping rules, isolated from UI so this can be swapped for a real
 * shipping API later without touching the cart/checkout components.
 */
const REMOTE_STATES = new Set([
  "Andaman and Nicobar Islands",
  "Lakshadweep",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
]);

const RATE_BY_STATE: Record<string, number> = {
  "Tamil Nadu": 100,
};

const DEFAULT_INDIA_RATE = 120;
const REMOTE_RATE = 150;
const INTERNATIONAL_RATE = 1500;

export async function getShippingEstimate(
  input: ShippingEstimateInput
): Promise<ShippingEstimateResult> {
  await new Promise((r) => setTimeout(r, 350));

  if (input.country.trim().toLowerCase() !== "india") {
    return {
      zoneLabel: input.country,
      amount: INTERNATIONAL_RATE,
      etaLabel: "10–18 business days",
    };
  }

  if (REMOTE_STATES.has(input.state)) {
    return {
      zoneLabel: `${input.state} (remote area)`,
      amount: REMOTE_RATE,
      etaLabel: "8–12 business days",
    };
  }

  const rate = RATE_BY_STATE[input.state] ?? DEFAULT_INDIA_RATE;
  return {
    zoneLabel: input.state,
    amount: rate,
    etaLabel: rate === RATE_BY_STATE["Tamil Nadu"] ? "3–5 business days" : "5–8 business days",
  };
}

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
