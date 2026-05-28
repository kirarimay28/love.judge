import { NextRequest, NextResponse } from 'next/server';
import { getAllCases, getCaseByReceipt, createCase } from '@/lib/db';
import { Case } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET() {
  const cases = getAllCases();
  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { receiptNumber, title, role, statement } = body;

  const existing = getCaseByReceipt(receiptNumber);

  if (existing) {
    if (role === '남자친구' && existing.boyfriend)
      return NextResponse.json({ error: '이미 남자친구 입장이 등록되었습니다.' }, { status: 400 });
    if (role === '여자친구' && existing.girlfriend)
      return NextResponse.json({ error: '이미 여자친구 입장이 등록되었습니다.' }, { status: 400 });

    const updates: Partial<Case> = {};
    if (role === '남자친구') updates.boyfriend = statement;
    if (role === '여자친구') updates.girlfriend = statement;

    const { updateCase } = await import('@/lib/db');
    const updated = updateCase(receiptNumber, updates);
    return NextResponse.json(updated);
  }

  const newCase: Case = {
    id: nanoid(),
    receiptNumber,
    title,
    createdAt: new Date().toISOString(),
    ...(role === '남자친구' ? { boyfriend: statement } : { girlfriend: statement }),
  };

  createCase(newCase);
  return NextResponse.json(newCase, { status: 201 });
}
