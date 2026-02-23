import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { getDashboardStats, getDataInventory } from '@/lib/intelligence/lookup';

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  try {
    if (view === 'inventory') {
      const inventory = await getDataInventory();
      return NextResponse.json(inventory);
    }

    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
