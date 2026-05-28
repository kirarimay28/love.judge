'use client';

import { useState, useEffect } from 'react';
import { Case } from '@/lib/types';
import VerdictView from './VerdictView';

export default function VerdictLookup() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selected, setSelected] = useState<Case | null>(null);
  const [receiptInput, setReceiptInput] = useState('');
  const [unlocked, setUnlocked] = useState<Case | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/cases').then(r => r.json()).then(data => setCases(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const judgedCases = cases.filter(c => c.judgment);

  async function handleUnlock() {
    if (!selected) return;
    if (receiptInput.trim() !== selected.receiptNumber) { setError('접수 번호가 일치하지 않습니다.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`/api/cases/${selected.receiptNumber}`);
      setUnlocked(await res.json());
    } catch { setError('서버 오류가 발생했습니다.'); } finally { setLoading(false); }
  }

  if (unlocked) return (
    <div className="space-y-4">
      <VerdictView c={unlocked} />
      <button onClick={() => { setUnlocked(null); setSelected(null); setReceiptInput(''); }}
        className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">← 목록으로 돌아가기</button>
    </div>
  );

  if (selected) return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
        <p className="text-xs text-gray-400 mb-1">판결 조회</p>
        <h3 className="font-bold text-gray-800 text-lg mb-4">{selected.title}</h3>
        <label className="block text-sm font-semibold text-gray-600 mb-2">접수 번호 입력</label>
        <div className="flex gap-2">
          <input className="flex-1 border border-pink-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
            placeholder="접수 번호를 입력하세요" value={receiptInput}
            onChange={e => setReceiptInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUnlock()} />
          <button onClick={handleUnlock} disabled={loading}
            className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? '확인 중...' : '조회'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      <button onClick={() => { setSelected(null); setReceiptInput(''); setError(''); }}
        className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">← 목록으로 돌아가기</button>
    </div>
  );

  return (
    <div className="space-y-4">
      {judgedCases.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="text-sm">아직 판결된 사건이 없습니다.</p>
        </div>
      ) : judgedCases.map(c => (
        <button key={c.id} onClick={() => setSelected(c)}
          className="w-full text-left bg-white hover:bg-pink-50 rounded-2xl p-5 border border-pink-100 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{c.title}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(c.judgment!.createdAt).toLocaleDateString('ko-KR')} 판결</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {c.judgment!.violenceWarning && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">⚠ 경고</span>}
              <span className="text-pink-400 text-lg">→</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
