import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next's default 1MB cap on a Server Action's request body is well below
  // a real product/banner/collection photo (a phone/camera JPG easily runs
  // 3-8MB) — every image upload in the admin goes through a Server Action
  // (uploadProductImageAction, saveCollectionAction, saveBannerAction), so
  // this raises the ceiling globally rather than per-route. 10mb comfortably
  // covers real photography while still being a firm bound, not unlimited.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary/loader.ts",
    // Defense-in-depth: even though the custom loader means Next never
    // proxies/optimizes these URLs itself, keep remotePatterns restrictive
    // (not a broad wildcard) per the backend brief's §12 instruction.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`,
      },
    ],
  },
};

export default nextConfig;
