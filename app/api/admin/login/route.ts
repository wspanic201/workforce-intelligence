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
  let password: string | null = null;
  
  // Handle both form data and JSON
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    password = body.password;
  } else {
    const formData = await request.formData();
    password = formData.get('password') as string;
  }

  if (!password) {
    console.log('[Admin Login] No password provided');
    return NextResponse.redirect(new URL('/admin/login?error=missing', request.url));
  }

  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) {
    console.error('[Admin Login] ADMIN_PASSWORD_HASH not set in env');
    return NextResponse.redirect(new URL('/admin/login?error=config', request.url));
  }

  const inputHash = hashPassword(password);
  console.log('[Admin Login] Hash comparison:', {
    inputHashPrefix: inputHash.substring(0, 8) + '...',
    expectedPrefix: adminPasswordHash.substring(0, 8) + '...',
    match: inputHash === adminPasswordHash,
  });
  
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
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });

  return response;
}
