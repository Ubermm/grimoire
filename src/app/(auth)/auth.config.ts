//@ts-nocheck
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

// Product pages that require an authenticated user. Visiting any of these while
// logged out bounces the visitor to the sign-up page.
const PROTECTED_PREFIXES = ["/analytics", "/audit", "/ai-act", "/ind-creation", "/ind-forms"];

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    // Gate the product pages. Runs in middleware on every matched request.
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;

      // Never interfere with API routes — they manage their own auth and must
      // return JSON, not an HTML redirect (a redirect here breaks /api/auth/*).
      if (path.startsWith("/api")) return true;

      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some(
        (p) => path === p || path.startsWith(p + "/")
      );

      if (isProtected && !isLoggedIn) {
        return NextResponse.redirect(new URL("/register", nextUrl));
      }
      return true;
    },
  },
  cookies: {},
} satisfies NextAuthConfig;
