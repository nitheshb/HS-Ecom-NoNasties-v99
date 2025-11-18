import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hello-stores.s3.eu-north-1.amazonaws.com',
        pathname: '/**',
      },
      // Add more S3 hostnames if needed
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      // Allow Firebase Storage images
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      // Allow any other external images you might use
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Use unoptimized to bypass the private IP check
    unoptimized: true,
  },
};

export default nextConfig;
