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
  // `experimental.turbo` was promoted to top-level `turbopack` in Next 15.3+.
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.ts',
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  // Next 16 notes:
  // - `experimental.ppr` was removed (merged into the stricter `cacheComponents`).
  //   Dropped here; the app uses standard rendering.
  // - The `eslint` config key is no longer supported (next lint was removed). Run
  //   ESLint via its own CLI instead.
  // - `next build` uses Turbopack by default, so the old dev-only webpack polling
  //   override was removed.
};

export default nextConfig;