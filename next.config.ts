import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Hide X-Powered-By header to obscure technology stack
  poweredByHeader: false,

  // Additional security headers (also set in middleware for redundancy)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
