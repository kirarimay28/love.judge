import { NextRequest, NextResponse } from 'next/server';
import { getCaseByReceipt } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const c = getCaseByReceipt(id);
  if (!c) return NextResponse.json({ error: '사건을 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json(c);
}
