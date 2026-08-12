export function formatPrice(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatDiscount(price: number, compareAtPrice: number): string {
  const pct = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return `${pct}% OFF`;
}
