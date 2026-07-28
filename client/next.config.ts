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
      {
        source: '/stream-proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_STREAM_SERVICE_URL || 'http://44.211.39.221:4000'}/:path*`,
      },
      {
        source: '/doubt-proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_DOUBT_SERVICE_URL || 'http://44.211.39.221:5001'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
