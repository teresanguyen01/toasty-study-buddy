import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem cache to avoid corrupted .next cache glitches during dev
      // (e.g., ENOENT rename errors, incorrect header check)
      // @ts-expect-error - cache typing is not strict here
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
