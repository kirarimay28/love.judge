'use client';

import { Case } from '@/lib/types';
import StarRating from './StarRating';

export default function VerdictView({ c }: { c: Case }) {
  const { judgment } = c;
  if (!judgment) return null;

  return (
    <div className="verdict-card rounded-2xl p-6 md:p-8 animate-fade-in space-y-6">
      <div className="text-center border-b border-pink-100 pb-4">
        <p className="text-xs text-gray-400 mb-1">접수번호 {c.receiptNumber}</p>
        <h2 className="text-xl font-bold text-gray-800">{c.title}</h2>
        <p className="text-xs text-gray-400 mt-1">판결일: {new Date(judgment.createdAt).toLocaleDateString('ko-KR')}</p>
      </div>

      {judgment.violenceWarning && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center">
          <div className="stamp-warning mb-2">⚠ 폭력성 경고</div>
          <p className="text-red-700 text-sm font-medium mt-2">
            이 사건에는 상대방에게 공포감을 줄 수 있는 언행이 포함되어 있습니다. 관계를 재고하거나 전문 상담을 받아보시길 권고합니다.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {([{ label: '고의성', key: 'intentionality', reason: judgment.intentionalityReason },
           { label: '폭력성', key: 'violence', reason: judgment.violenceReason },
           { label: '반복성', key: 'repetition', reason: judgment.repetitionReason }] as const)
          .map(({ label, key, reason }) => (
          <div key={key} className="bg-white rounded-xl p-4 border border-pink-50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">{label}</span>
              <StarRating value={judgment[key]} />
            </div>
            <p className="text-sm text-gray-500">{reason}</p>
          </div>
        ))}
      </div>

      <div className="bg-pink-50 rounded-xl p-5 border border-pink-100">
        <h3 className="font-bold text-gray-700 mb-2">⚖️ 판결 요약</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{judgment.summary}</p>
      </div>

      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-5 border border-purple-100">
        <h3 className="font-bold text-gray-700 mb-2">💡 해결 방안</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{judgment.solution}</p>
      </div>
    </div>
  );
}
