import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_frameworks', searchColumns: ['framework_name', 'organization', 'summary', 'tags::text'], filterColumns: ['framework_type', 'category'], defaultOrder: 'framework_name' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_frameworks'); }
