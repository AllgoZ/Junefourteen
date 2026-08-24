import { unstable_cache } from "next/cache";
import { listActiveBanners } from "@/lib/repositories/banners";
import { dbBannerToBanner } from "@/lib/mappers/banner";
import type { Banner } from "@/types/product";

const getCachedBanners = unstable_cache(
  async () => (await listActiveBanners()).map(dbBannerToBanner),
  ["banners"],
  { tags: ["banners"], revalidate: 3600 }
);

export async function getBanners(): Promise<Banner[]> {
  return getCachedBanners();
}
