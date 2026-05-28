'use client';

import { useState } from 'react';
import { Case } from '@/lib/types';
import VerdictView from './VerdictView';

interface JudgePanelProps {
  submittedCase: Case;
  onReset: () => void;
}

export default function JudgePanel({ submittedCase: initial, onReset }: JudgePanelProps) {
  const [c, setC] = useState<Case>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bothReady = !!(c.boyfriend && c.girlfriend);

  async function handleJudge() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/cases/${c.receiptNumber}/judge`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '오류가 발생했습니다.'); return; }
      setC(data);
    } catch { setError('서버 오류가 발생했습니다.'); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">접수번호 {c.receiptNumber}</p>
            <h3 className="font-bold text-gray-800 text-lg">{c.title}</h3>
          </div>
          <div className="flex gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs ${c.boyfriend ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>💙 남자친구</span>
            <span className={`px-2 py-1 rounded-full text-xs ${c.girlfriend ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-400'}`}>🩷 여자친구</span>
          </div>
        </div>

        {!bothReady && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>입장 대기 중</strong><br />
            {!c.boyfriend && '남자친구가 아직 입장을 제출하지 않았습니다. '}
            {!c.girlfriend && '여자친구가 아직 입장을 제출하지 않았습니다. '}
            <br />접수번호 <strong>{c.receiptNumber}</strong>를 상대방에게 알려주세요.
          </div>
        )}

        {bothReady && !c.judgment && (
          <button onClick={handleJudge} disabled={loading}
            className="w-full mt-3 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-base transition-all shadow-md disabled:opacity-50">
            {loading ? '⚖️ 판결 중...' : '⚖️ 사건 제출 및 판결받기'}
          </button>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {c.judgment && <VerdictView c={c} />}

      <button onClick={onReset} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← 새 사건 접수하기
      </button>
    </div>
  );
}
