import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getDashboardStats } from '@/lib/intelligence/lookup';

export async function GET() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
