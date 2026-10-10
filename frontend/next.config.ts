import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (Vercel ignores it).
  output: 'standalone',
};

export default nextConfig;
