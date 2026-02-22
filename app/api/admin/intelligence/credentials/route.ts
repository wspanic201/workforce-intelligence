import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_credentials', searchColumns: ['credential_name', 'regulatory_body'], filterColumns: ['state', 'credential_type'], defaultOrder: 'state' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_credentials'); }
