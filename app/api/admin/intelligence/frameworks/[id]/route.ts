import { NextRequest } from 'next/server';
import { handleGet, handleUpdate, handleDelete } from '@/lib/intelligence/crud';
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; return handleGet(id, 'intel_frameworks');
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; return handleUpdate(req, id, 'intel_frameworks');
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; return handleDelete(id, 'intel_frameworks');
}
