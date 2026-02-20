/**
 * Admin authentication and session management
 * Simple password-based auth for /admin routes
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Session cookie name
const SESSION_COOKIE = 'wavelength_admin_session';

// Session duration (4 hours)
const SESSION_DURATION = 4 * 60 * 60 * 1000;

// In-memory session store (upgrade to Redis/DB for multi-instance later)
const sessions = new Map<string, { createdAt: number; lastActivity: number }>();

/**
 * Hash password with SHA-256 (simple, upgrade to bcrypt for production scale)
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
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

  const inputHash = hashPassword(password);
  return inputHash === adminPasswordHash;
}

/**
 * Create a new admin session
 */
export async function createAdminSession(): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  
  sessions.set(sessionId, {
    createdAt: now,
    lastActivity: now,
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000, // in seconds
    path: '/admin',
  });

  // Cleanup old sessions
  cleanupExpiredSessions();

  return sessionId;
}

/**
 * Verify admin session from request
 */
export async function verifyAdminSession(request?: NextRequest): Promise<boolean> {
  let sessionId: string | undefined;

  if (request) {
    // Middleware context - read from request cookies
    sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  } else {
    // Server component context - use cookies() function
    const cookieStore = await cookies();
    sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  }

  if (!sessionId) {
    return false;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  const now = Date.now();
  const sessionAge = now - session.createdAt;

  // Check if session expired
  if (sessionAge > SESSION_DURATION) {
    sessions.delete(sessionId);
    return false;
  }

  // Update last activity
  session.lastActivity = now;
  sessions.set(sessionId, session);

  return true;
}

/**
 * Destroy admin session
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    sessions.delete(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Cleanup expired sessions (run periodically)
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  const expired: string[] = [];

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_DURATION) {
      expired.push(sessionId);
    }
  }

  expired.forEach(id => sessions.delete(id));

  if (expired.length > 0) {
    console.log(`[Admin Auth] Cleaned up ${expired.length} expired sessions`);
  }
}

/**
 * Generate password hash for setup
 * Usage: node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('your-password').digest('hex'))"
 */
export function generatePasswordHash(password: string): string {
  return hashPassword(password);
}
