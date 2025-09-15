import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_EXPRESS_API_URL: process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3002',
  },
};

export default nextConfig;
