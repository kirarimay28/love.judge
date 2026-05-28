import { NextRequest, NextResponse } from 'next/server';
import { getCaseByReceipt, updateCase } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const c = await getCaseByReceipt(id);

  if (!c) return NextResponse.json({ error: '사건을 찾을 수 없습니다.' }, { status: 404 });
  if (!c.boyfriend || !c.girlfriend)
    return NextResponse.json({ error: '양측 모두 입장을 제출해야 판결이 가능합니다.' }, { status: 400 });
  if (c.judgment) return NextResponse.json(c);

  const prompt = `당신은 커플 갈등을 전문적으로 분석하는 판사입니다. 아래 사건을 분석하고 JSON으로 판결해주세요.

[사건 제목]: ${c.title}

[남자친구 입장]
- 언제: ${c.boyfriend.when}
- 무엇을: ${c.boyfriend.what}
- 어떻게: ${c.boyfriend.how}
- 기분: ${c.boyfriend.feelings}
- 본인 잘못: ${c.boyfriend.myFault}
- 바라는 바: ${c.boyfriend.wishes}

[여자친구 입장]
- 언제: ${c.girlfriend.when}
- 무엇을: ${c.girlfriend.what}
- 어떻게: ${c.girlfriend.how}
- 기분: ${c.girlfriend.feelings}
- 본인 잘못: ${c.girlfriend.myFault}
- 바라는 바: ${c.girlfriend.wishes}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "intentionality": <1-5 사이 정수, 5가 가장 고의적>,
  "intentionalityReason": "<고의성 평가 이유 2-3문장>",
  "violence": <1-5 사이 정수, 5가 가장 폭력적>,
  "violenceReason": "<폭력성 평가 이유 2-3문장>",
  "repetition": <1-5 사이 정수, 5가 가장 반복적>,
  "repetitionReason": "<반복성 평가 이유 2-3문장>",
  "summary": "<전체 사건 요약 및 판결 3-4문장>",
  "solution": "<두 사람을 위한 구체적 해결책 및 조언 4-5문장>"
}`;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch)
    return NextResponse.json({ error: 'AI 판결 생성에 실패했습니다.' }, { status: 500 });

  const parsed = JSON.parse(jsonMatch[0]);
  const judgment = { ...parsed, violenceWarning: parsed.violence >= 3, createdAt: new Date().toISOString() };

  const updated = await updateCase(id, { judgment });
  return NextResponse.json(updated);
}
