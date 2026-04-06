import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    strict: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdn.example.com',
      },
    ],
  },
};

export default nextConfig;
