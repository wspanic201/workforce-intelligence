import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple password store (in production, this would come from your DB)
// For demo, the password is "waketechwins"
const DEMO_PASSWORD = 'waketechwins';
const DEMO_HAS_PASSWORD = false; // Set to true to test password gate

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // For now, only "demo" token is supported
  if (token !== 'demo') {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // Check password if required
  if (DEMO_HAS_PASSWORD) {
    const cookieName = `report_access_${token}`;
    const accessCookie = request.cookies.get(cookieName);
    if (!accessCookie || accessCookie.value !== '1') {
      return NextResponse.json(
        { error: 'password_required', hasPassword: true },
        { status: 401 }
      );
    }
  }

  // Load demo data from file
  try {
    const dataPath = '/tmp/wake-tech-report-data.json';
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json({
      ...data,
      reportConfig: {
        token,
        hasPassword: DEMO_HAS_PASSWORD,
        generatedAt: data.brief?.generatedAt || new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load report data' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (token !== 'demo') {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const body = await request.json();
  const { password } = body;

  if (password === DEMO_PASSWORD) {
    const cookieName = `report_access_${token}`;
    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieName, '1', {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
}
