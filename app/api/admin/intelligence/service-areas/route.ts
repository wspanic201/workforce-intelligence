import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_service_areas', searchColumns: ['county_name'], filterColumns: ['state', 'institution_id'], defaultOrder: 'county_name' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_service_areas'); }
