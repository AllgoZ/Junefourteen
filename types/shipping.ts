export interface ShippingEstimateInput {
  country: string;
  state: string;
  pin: string;
}

export interface ShippingEstimateResult {
  zoneLabel: string;
  amount: number;
  etaLabel: string;
}
