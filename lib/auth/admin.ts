/**
 * Admin authentication - JWT-based for serverless compatibility
 * Uses signed cookies instead of in-memory sessions
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

const SESSION_COOKIE = 'wavelength_admin';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Hash password with SHA-256
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Create HMAC signature for session token
 */
function signToken(payload: string): string {
  const secret = process.env.ADMIN_PASSWORD_HASH || 'fallback';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify admin password against environment variable
 */
export function verifyAdminPassword(password: string): boolean {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) {
    console.error('[Admin Auth] ADMIN_PASSWORD_HASH not set');
    return false;
  }
  return hashPassword(password) === adminPasswordHash;
}

/**
 * Create admin session (sets signed cookie)
 */
export async function createAdminSession(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = `admin:${expiresAt}`;
  const signature = signToken(payload);
  const token = `${payload}:${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/admin',
  });

  return token;
}

/**
 * Verify admin session from cookie (works in middleware or server components)
 */
export async function verifyAdminSession(request?: NextRequest): Promise<boolean> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(SESSION_COOKIE)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE)?.value;
  }

  if (!token) return false;

  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [role, expiresAtStr, signature] = parts;
  const payload = `${role}:${expiresAtStr}`;

  // Verify signature
  const expectedSig = signToken(payload);
  if (signature !== expectedSig) return false;

  // Check expiry
  const expiresAt = parseInt(expiresAtStr, 10);
  if (Date.now() > expiresAt) return false;

  return true;
}

/**
 * Destroy admin session
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
