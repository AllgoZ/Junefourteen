import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
