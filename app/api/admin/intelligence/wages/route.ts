import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_wages', searchColumns: ['soc_code', 'occupation_title'], filterColumns: ['geo_level', 'geo_code', 'soc_code'], defaultOrder: 'occupation_title' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_wages'); }
