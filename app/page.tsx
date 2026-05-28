'use client';

import { useState } from 'react';
import { Case } from '@/lib/types';
import CaseForm from '@/components/CaseForm';
import JudgePanel from '@/components/JudgePanel';
import VerdictLookup from '@/components/VerdictLookup';

type Tab = 'file' | 'lookup';

export default function Home() {
  const [tab, setTab] = useState<Tab>('file');
  const [submittedCase, setSubmittedCase] = useState<Case | null>(null);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="bg-white border-b border-pink-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          <div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">마따이</h1>
            <p className="text-xs text-gray-400">커플 갈등 해결소 · 공정한 판결을 약속합니다</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5">
        <div className="flex bg-white rounded-2xl p-1 border border-pink-100 shadow-sm mb-6">
          {([{ key: 'file', label: '사건 접수', icon: '📋' }, { key: 'lookup', label: '판결 조회', icon: '🔍' }] as const).map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === key ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="pb-12">
          {tab === 'file' && (
            <div className="bg-white rounded-2xl p-5 md:p-7 border border-pink-100 shadow-sm">
              {!submittedCase ? (
                <>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">사건 접수</h2>
                  <p className="text-xs text-gray-400 mb-5">접수 번호를 만들거나 입력하고 입장을 제출하세요. 양측 모두 제출하면 판결이 가능합니다.</p>
                  <CaseForm onSuccess={c => setSubmittedCase(c)} />
                </>
              ) : (
                <JudgePanel submittedCase={submittedCase} onReset={() => setSubmittedCase(null)} />
              )}
            </div>
          )}
          {tab === 'lookup' && (
            <div className="bg-white rounded-2xl p-5 md:p-7 border border-pink-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-1">판결 조회</h2>
              <p className="text-xs text-gray-400 mb-5">판결된 사건을 선택하고 접수 번호를 입력하면 판결 내용을 확인할 수 있습니다.</p>
              <VerdictLookup />
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-gray-300 pb-6">마따이 · 사랑은 공정하게 ❤️</footer>
    </div>
  );
}
