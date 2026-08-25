/**
 * Deliberately its own file with zero other imports. lib/services/shipping.ts
 * now does a real (server-only) DB read, so any client component that
 * imported INDIAN_STATES from there would pull that whole server-only
 * dependency chain into the browser bundle and fail to build — this constant
 * needs a leaf module of its own so client components (checkout-content.tsx,
 * admin/addresses-panel.tsx, shipping-zone-form.tsx) can use it safely.
 */
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
