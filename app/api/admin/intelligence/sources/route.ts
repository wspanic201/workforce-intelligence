import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_sources', searchColumns: ['title', 'publisher', 'summary'], filterColumns: ['source_type'], defaultOrder: 'created_at' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_sources'); }
