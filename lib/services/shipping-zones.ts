import { unstable_cache } from "next/cache";
import { listActiveShippingZones, type ShippingZoneRow } from "@/lib/repositories/shipping-zones";

export const getShippingZones = unstable_cache(
  async (): Promise<ShippingZoneRow[]> => listActiveShippingZones(),
  ["shipping-zones"],
  { tags: ["shipping-zones"], revalidate: 3600 }
);
