'use client';

import { useState } from 'react';
import { Case, Statement } from '@/lib/types';

interface CaseFormProps {
  onSuccess: (c: Case) => void;
}

const EMPTY_STATEMENT: Omit<Statement, 'role'> = {
  when: '', what: '', how: '', feelings: '', myFault: '', wishes: '',
};

export default function CaseForm({ onSuccess }: CaseFormProps) {
  const [step, setStep] = useState<'init' | 'form'>('init');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<'남자친구' | '여자친구' | ''>('');
  const [stmt, setStmt] = useState({ ...EMPTY_STATEMENT });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingCase, setExistingCase] = useState<Case | null>(null);

  async function handleReceiptCheck() {
    if (!receiptNumber.trim()) { setError('접수 번호를 입력해주세요.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${receiptNumber.trim()}`);
      if (res.ok) {
        const data: Case = await res.json();
        setExistingCase(data);
        setTitle(data.title);
      } else {
        setExistingCase(null);
      }
      setStep('form');
    } catch { setError('서버 오류가 발생했습니다.'); } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { setError('본인 자격을 선택해주세요.'); return; }
    if (!title.trim()) { setError('사건 제목을 입력해주세요.'); return; }
    if (Object.values(stmt).some(v => !v.trim())) { setError('모든 항목을 입력해주세요.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptNumber: receiptNumber.trim(), title: title.trim(), role, statement: { role, ...stmt } }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '오류가 발생했습니다.'); return; }
      onSuccess(data);
    } catch { setError('서버 오류가 발생했습니다.'); } finally { setLoading(false); }
  }

  const field = (key: keyof typeof stmt, label: string, placeholder: string) => (
    <div key={key}>
      <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
      <textarea className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
        rows={3} placeholder={placeholder} value={stmt[key]}
        onChange={e => setStmt(prev => ({ ...prev, [key]: e.target.value }))} />
    </div>
  );

  if (step === 'init') {
    return (
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">접수 번호</label>
          <div className="flex gap-2">
            <input className="flex-1 border border-pink-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              placeholder="새 사건은 직접 번호를 만들어 입력하세요 (예: LOVE-001)"
              value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReceiptCheck()} />
            <button onClick={handleReceiptCheck} disabled={loading}
              className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? '확인 중...' : '확인'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">기존 사건에 참여하려면 상대방이 알려준 번호를 입력하세요.</p>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {existingCase && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          기존 사건이 존재합니다. 상대방 입장을 추가합니다.
          {existingCase.boyfriend && <span className="ml-2 font-semibold">[남자친구 입장 등록됨]</span>}
          {existingCase.girlfriend && <span className="ml-2 font-semibold">[여자친구 입장 등록됨]</span>}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">사건 제목</label>
        <input className="w-full border border-pink-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white disabled:bg-gray-50"
          placeholder="예: 약속 취소 사건, 말실수 사건" value={title} disabled={!!existingCase}
          onChange={e => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">본인 자격</label>
        <div className="flex gap-3">
          {(['남자친구', '여자친구'] as const).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              disabled={!!(existingCase?.boyfriend && r === '남자친구') || !!(existingCase?.girlfriend && r === '여자친구')}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                role === r ? 'bg-pink-500 border-pink-500 text-white' : 'border-pink-200 text-gray-600 hover:border-pink-400'
              } disabled:opacity-40 disabled:cursor-not-allowed`}>
              {r === '남자친구' ? '💙 남자친구' : '🩷 여자친구'}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-pink-100 pt-4 space-y-4">
        <h3 className="text-sm font-bold text-gray-700">입장 표명</h3>
        {field('when', '언제', '언제 이 일이 발생했나요?')}
        {field('what', '무엇을', '무슨 일이 있었나요?')}
        {field('how', '어떻게', '상대방이 어떻게 행동했나요?')}
        {field('feelings', '무슨 기분이 들었는지', '그 상황에서 어떤 감정을 느꼈나요?')}
      </div>

      <div className="border-t border-pink-100 pt-4 space-y-4">
        {field('myFault', '본인의 잘못', '이번 일에서 본인이 잘못한 부분이 있다면 솔직하게 적어주세요.')}
        {field('wishes', '바라는 바', '상대방이 어떻게 해줬으면 하나요?')}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50">
        {loading ? '제출 중...' : '입장 제출하기'}
      </button>

      <button type="button"
        onClick={() => { setStep('init'); setExistingCase(null); setRole(''); setStmt({ ...EMPTY_STATEMENT }); setError(''); }}
        className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">
        ← 접수 번호 다시 입력
      </button>
    </form>
  );
}
