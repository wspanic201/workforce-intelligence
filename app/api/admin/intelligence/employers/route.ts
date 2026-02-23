import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_employers', searchColumns: ['employer_name', 'industry', 'city'], filterColumns: ['state', 'msa', 'naics_code'], defaultOrder: 'employer_name' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_employers'); }
