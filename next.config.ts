import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output keeps the Docker image small and self-contained (no need
  // to copy node_modules into the runner stage).
  output: "standalone",
};

export default nextConfig;
