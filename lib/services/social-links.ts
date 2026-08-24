import { unstable_cache } from "next/cache";
import { listActiveSocialLinks, type SocialLinkRow } from "@/lib/repositories/social-links";

const getCachedSocialLinks = unstable_cache(
  async () => listActiveSocialLinks(),
  ["social-links"],
  { tags: ["social-links"], revalidate: 3600 }
);

export async function getSocialLinks(): Promise<SocialLinkRow[]> {
  return getCachedSocialLinks();
}
