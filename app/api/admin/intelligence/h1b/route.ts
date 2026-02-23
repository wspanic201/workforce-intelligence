import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_h1b_demand', searchColumns: ['soc_code', 'soc_title'], filterColumns: ['state', 'fiscal_year'], defaultOrder: 'applications_total', defaultLimit: 25 });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_h1b_demand'); }
