import { NextRequest, NextResponse } from 'next/server';
import { adminLogin, adminLogout, isAdminAuthenticated } from '@/lib/admin/auth';

/** POST /api/admin/auth — Login */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const success = await adminLogin(password);
    
    if (success) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

/** GET /api/admin/auth — Check session */
export async function GET() {
  const authed = await isAdminAuthenticated();
  return NextResponse.json({ authenticated: authed });
}

/** DELETE /api/admin/auth — Logout */
export async function DELETE() {
  await adminLogout();
  return NextResponse.json({ ok: true });
}
