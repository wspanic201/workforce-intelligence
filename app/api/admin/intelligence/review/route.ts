import { NextRequest } from 'next/server';
import { handleList, handleCreate } from '@/lib/intelligence/crud';
export async function GET(req: NextRequest) {
  return handleList(req, { table: 'intel_review_queue', searchColumns: ['claim_text', 'report_name'], filterColumns: ['verification_status', 'claim_category'], defaultOrder: 'created_at' });
}
export async function POST(req: NextRequest) { return handleCreate(req, 'intel_review_queue'); }
