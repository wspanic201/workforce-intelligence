import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const testPassword = '6-bqjIHqPvbSW5196NkhGg';
  const hash = crypto.createHash('sha256').update(testPassword).digest('hex');
  const envHash = process.env.ADMIN_PASSWORD_HASH || 'NOT SET';
  
  return NextResponse.json({
    testPasswordHash: hash,
    envHash: envHash,
    match: hash === envHash,
    envHashLength: envHash.length,
    testHashLength: hash.length,
    envFirst8: envHash.substring(0, 8),
    testFirst8: hash.substring(0, 8),
  });
}
