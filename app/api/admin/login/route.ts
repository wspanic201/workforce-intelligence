/**
 * POST /api/admin/login
 * Handles admin login, sets session cookie, redirects to /admin
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SESSION_COOKIE = 'wavelength_admin';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function signToken(payload: string): string {
  const secret = process.env.ADMIN_PASSWORD_HASH || 'fallback';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get('password') as string;

  if (!password) {
    return NextResponse.redirect(new URL('/admin/login?error=missing', request.url));
  }

  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) {
    console.error('[Admin Auth] ADMIN_PASSWORD_HASH not set');
    return NextResponse.redirect(new URL('/admin/login?error=config', request.url));
  }

  const inputHash = hashPassword(password);
  if (inputHash !== adminPasswordHash) {
    return NextResponse.redirect(new URL('/admin/login?error=invalid', request.url));
  }

  // Create signed token
  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = `admin:${expiresAt}`;
  const signature = signToken(payload);
  const token = `${payload}:${signature}`;

  // Redirect to admin with session cookie
  const response = NextResponse.redirect(new URL('/admin', request.url));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });

  return response;
}
