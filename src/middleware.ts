// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/analytics/:path*',
    '/audit/:path*',
    '/ai-act/:path*',
    '/api/:path*',
    '/login',
    '/register',
  ],
};