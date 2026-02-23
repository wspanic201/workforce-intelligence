import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_completions', searchColumns: ['cip_code', 'cip_title', 'ipeds_id'], filterColumns: ['year', 'award_level'], defaultOrder: 'cip_title' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_completions'); }
