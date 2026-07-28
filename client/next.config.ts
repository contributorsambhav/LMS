import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/backend-proxy/:path*',
        // We read from the env if it exists, fallback to the direct IP
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://44.211.39.221:5000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
