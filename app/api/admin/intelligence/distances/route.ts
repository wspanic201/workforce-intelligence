import { NextRequest } from 'next/server';
import { handleList } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_distances', defaultOrder: 'computed_at' });
}
