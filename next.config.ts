import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.EMRANLABS_DIST_DIR?.trim() || ".next",
};

export default nextConfig;
