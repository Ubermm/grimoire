import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  distDir: 'build',
  output: 'standalone',
  // NOTE: Do NOT add an `env: {...}` block here for secrets. Next.js inlines those
  // values into the CLIENT bundle (leaking them to the browser), and exposing
  // NEXTAUTH_URL this way forces next-auth's browser client to fetch /api/auth/*
  // from that absolute origin instead of same-origin. Server code (route handlers,
  // server actions) reads process.env from .env automatically — no block needed.
  experimental: {
    ppr: true,
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
      },
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
};

export default nextConfig;