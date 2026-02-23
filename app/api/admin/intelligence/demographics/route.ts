import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_county_demographics', searchColumns: ['county_name'], filterColumns: ['state'], defaultOrder: 'county_name' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_county_demographics'); }
