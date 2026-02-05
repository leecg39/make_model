// @TASK P1-S2-T1 - 회원가입 데모 페이지
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type DemoState = 'brand-role' | 'creator-role' | 'validation-error';

const DEMO_STATES = {
  'brand-role': {
    step: 1,
    role: 'brand',
    description: '브랜드 역할 선택 상태',
  },
  'creator-role': {
    step: 1,
    role: 'creator',
    description: '크리에이터 역할 선택 상태',
  },
  'validation-error': {
    step: 2,
    role: 'brand',
    email: 'invalid-email',
    password: '123',
    passwordConfirm: '456',
    nickname: 'a',
    company_name: '',
    description: '유효성 검증 에러 표시 상태',
  },
} as const;

export default function SignupDemoPage() {
  const [state, setState] = useState<DemoState>('brand-role');
  const currentState = DEMO_STATES[state];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      {/* 상태 선택기 */}
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">회원가입 데모</h1>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                state === s
                  ? 'bg-[#c8ff00] text-black'
                  : 'bg-[#141414] text-white border border-white/20 hover:border-white/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 컴포넌트 렌더링 영역 */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 실제 컴포넌트 렌더링 */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">컴포넌트 프리뷰</h2>
            <SignupFormPreview state={state} />
          </div>

          {/* 우측: 상태 정보 */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">상태 정보</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-white/60 mb-1">현재 상태</p>
                <p className="text-white font-mono">{state}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">설명</p>
                <p className="text-white">{currentState.description}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">상태 데이터</p>
                <pre className="text-xs text-white/80 bg-[#0a0a0a] p-3 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(currentState, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 사용법 안내 */}
      <div className="max-w-4xl mx-auto mt-8 bg-[#141414] border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">💡 사용법</h2>
        <ul className="space-y-2 text-white/80 text-sm">
          <li>• <strong>brand-role</strong>: 브랜드 역할 카드가 선택된 상태 (Step 1)</li>
          <li>• <strong>creator-role</strong>: 크리에이터 역할 카드가 선택된 상태 (Step 1)</li>
          <li>• <strong>validation-error</strong>: 모든 필드에 유효성 에러가 표시된 상태 (Step 2)</li>
        </ul>
      </div>
    </div>
  );
}

// 간소화된 프리뷰 컴포넌트
function SignupFormPreview({ state }: { state: DemoState }) {
  const demoState = DEMO_STATES[state];
  const [step, setStep] = useState(demoState.step as 1 | 2);
  const [selectedRole, setSelectedRole] = useState<'brand' | 'creator' | null>(
    demoState.role as 'brand' | 'creator' | null
  );

  const showErrors = state === 'validation-error';

  return (
    <div className="space-y-6">
      {/* 진행 단계 */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-12 h-1 rounded-full transition-colors ${step === 1 ? 'bg-[#c8ff00]' : 'bg-white/20'}`} />
        <div className={`w-12 h-1 rounded-full transition-colors ${step === 2 ? 'bg-[#c8ff00]' : 'bg-white/20'}`} />
      </div>

      {step === 1 ? (
        // Step 1: 역할 선택
        <div>
          <h3 className="text-white font-semibold mb-4">역할을 선택해주세요</h3>
          <div className="space-y-3">
            {/* 브랜드 카드 */}
            <button
              type="button"
              onClick={() => setSelectedRole('brand')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedRole === 'brand'
                  ? 'border-[#c8ff00] bg-[#c8ff00]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">🏢</div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">브랜드 (광고주)</h4>
                  <p className="text-xs text-white/60">AI 모델을 탐색하고 섭외</p>
                </div>
              </div>
            </button>

            {/* 크리에이터 카드 */}
            <button
              type="button"
              onClick={() => setSelectedRole('creator')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedRole === 'creator'
                  ? 'border-[#c8ff00] bg-[#c8ff00]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎨</div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">크리에이터 (모델 제작자)</h4>
                  <p className="text-xs text-white/60">AI 모델을 제작하고 판매</p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-[#c8ff00] text-black py-2 rounded-full font-semibold text-sm mt-4"
          >
            다음
          </button>
        </div>
      ) : (
        // Step 2: 정보 입력
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setStep(1)}
              className="text-white/60 hover:text-white text-sm"
            >
              ← 이전
            </button>
            <h3 className="text-white font-semibold">정보 입력</h3>
            <div className="w-12" />
          </div>

          <div className="space-y-3">
            {/* 이메일 */}
            <div>
              <label className="block text-xs text-white mb-1">이메일</label>
              <input
                type="text"
                defaultValue={showErrors ? 'invalid-email' : ''}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="example@email.com"
              />
              {showErrors && (
                <p className="text-red-400 text-xs mt-1">올바른 이메일 형식이 아닙니다.</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-xs text-white mb-1">비밀번호</label>
              <input
                type="password"
                defaultValue={showErrors ? '123' : ''}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="최소 8자, 영문+숫자"
              />
              {showErrors && (
                <>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1 flex-1 rounded-full bg-red-500" />
                    <div className="h-1 flex-1 rounded-full bg-white/20" />
                    <div className="h-1 flex-1 rounded-full bg-white/20" />
                  </div>
                  <p className="text-red-400 text-xs mt-1">비밀번호는 최소 8자 이상이어야 합니다.</p>
                </>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-xs text-white mb-1">비밀번호 확인</label>
              <input
                type="password"
                defaultValue={showErrors ? '456' : ''}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              />
              {showErrors && (
                <p className="text-red-400 text-xs mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-xs text-white mb-1">닉네임</label>
              <input
                type="text"
                defaultValue={showErrors ? 'a' : ''}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="2-20자"
              />
              {showErrors && (
                <p className="text-red-400 text-xs mt-1">닉네임은 2-20자 사이여야 합니다.</p>
              )}
            </div>

            {/* 회사명 (brand일 때만) */}
            {selectedRole === 'brand' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-xs text-white mb-1">
                  회사명 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  defaultValue=""
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="회사명을 입력하세요"
                />
                {showErrors && (
                  <p className="text-red-400 text-xs mt-1">회사명을 입력해주세요.</p>
                )}
              </motion.div>
            )}
          </div>

          {showErrors && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs">회원가입에 실패했습니다.</p>
            </div>
          )}

          <button
            className="w-full bg-[#c8ff00] text-black py-2 rounded-full font-semibold text-sm mt-4"
          >
            회원가입
          </button>
        </div>
      )}
    </div>
  );
}
