/**
 * Next.js middleware for route protection
 * Protects /admin routes with authentication
 * 
 * Uses Web Crypto API (Edge Runtime compatible - no Node.js crypto)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'wavelength_admin';

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [role, expiresAtStr, signature] = parts;
  const payload = `${role}:${expiresAtStr}`;

  // Verify signature using Web Crypto API (Edge compatible)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (signature !== expectedSig) return false;

  // Check expiry
  const expiresAt = parseInt(expiresAtStr, 10);
  if (Date.now() > expiresAt) return false;

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const secret = process.env.ADMIN_PASSWORD_HASH;

    if (!token || !secret) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const isValid = await verifyToken(token, secret);
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
