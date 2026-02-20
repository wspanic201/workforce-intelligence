/**
 * Next.js middleware for route protection
 * Protects /admin routes with authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession } from './lib/auth/admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin')) {
    // Allow login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Verify session
    const isAuthenticated = await verifyAdminSession(request);

    if (!isAuthenticated) {
      // Redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
