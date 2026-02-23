import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_occupation_skills', searchColumns: ['soc_code', 'occupation_title', 'skill_name'], filterColumns: ['skill_type', 'category'], defaultOrder: 'occupation_title' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_occupation_skills'); }
