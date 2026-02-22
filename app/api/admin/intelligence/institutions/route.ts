import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_institutions', searchColumns: ['name', 'short_name', 'city', 'ipeds_id'], filterColumns: ['state', 'type', 'system_name'], defaultOrder: 'name' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_institutions'); }
