export interface ShippingEstimateInput {
  country: string;
  state: string;
  pin: string;
  /** Optional — lets a matched zone's free_shipping_threshold apply. Omitted, shipping is never free. */
  orderSubtotal?: number;
}

export interface ShippingEstimateResult {
  zoneLabel: string;
  amount: number;
  etaLabel: string;
}
