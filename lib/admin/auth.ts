/**
 * Simple admin auth — password-based, cookie session.
 * NOT Supabase auth. Just a single admin password for Matt.
 * 
 * Set ADMIN_PASSWORD in .env.local
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'wos_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('ADMIN_PASSWORD not set in environment');
  return pw;
}

/** Generate a simple session token from the password */
function makeToken(password: string): string {
  // Simple hash — not crypto-grade, but fine for single-user admin
  let hash = 0;
  const str = `wos:${password}:${process.env.ADMIN_PASSWORD}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `wos_${Math.abs(hash).toString(36)}`;
}

/** Check if the current request has a valid admin session */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return token === makeToken(getAdminPassword());
  } catch {
    return false;
  }
}

/** Verify password and set session cookie */
export async function adminLogin(password: string): Promise<boolean> {
  if (password !== getAdminPassword()) return false;
  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, makeToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return true;
}

/** Clear session cookie */
export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Middleware helper — returns 401 response if not authenticated */
export async function requireAdmin(): Promise<NextResponse | null> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
