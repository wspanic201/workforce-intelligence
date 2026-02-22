import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_statutes', searchColumns: ['title', 'code_chapter', 'summary'], filterColumns: ['state', 'category', 'status'], defaultOrder: 'state' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_statutes'); }
