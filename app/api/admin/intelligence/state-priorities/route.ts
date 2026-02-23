import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_state_priorities', searchColumns: ['occupation_title', 'soc_code', 'sector'], filterColumns: ['state', 'sector', 'priority_level'], defaultOrder: 'occupation_title' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_state_priorities'); }
