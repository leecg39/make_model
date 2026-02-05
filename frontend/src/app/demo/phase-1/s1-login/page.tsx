// @TASK P1-S1-T1 - Login page demo
// @SPEC Phase 1 Login Screen Demo
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type DemoState = 'default' | 'error' | 'loading';

const DEMO_STATES = {
  default: {
    email: '',
    password: '',
    error: null,
    isLoading: false,
  },
  error: {
    email: 'test@example.com',
    password: 'password',
    error: '이메일 또는 비밀번호가 올바르지 않습니다',
    isLoading: false,
  },
  loading: {
    email: 'test@example.com',
    password: 'password123',
    error: null,
    isLoading: true,
  },
} as const;

export default function LoginDemoPage() {
  const [state, setState] = useState<DemoState>('default');
  const currentState = DEMO_STATES[state];

  const [formData, setFormData] = useState({
    email: currentState.email,
    password: currentState.password,
  });

  const handleStateChange = (newState: DemoState) => {
    setState(newState);
    setFormData({
      email: DEMO_STATES[newState].email,
      password: DEMO_STATES[newState].password,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('데모 모드: 폼 제출이 비활성화되어 있습니다');
  };

  const handleSocialLogin = (provider: string) => {
    alert(`데모 모드: ${provider} 로그인`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* State Selector */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">로그인 페이지 데모</h2>
          <div className="flex gap-2">
            {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStateChange(s)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${
                    state === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {s === 'default' && '기본'}
                {s === 'error' && '에러'}
                {s === 'loading' && '로딩'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Component Rendering */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">로그인</h1>
            <p className="text-sm text-gray-600">
              아직 계정이 없으신가요?{' '}
              <Link
                href="/auth/signup"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                회원가입하기
              </Link>
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Global Error Message */}
            {currentState.error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4"
              >
                <p className="text-sm text-red-800 font-medium">{currentState.error}</p>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    transition-colors
                  "
                  placeholder="이메일을 입력하세요"
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    transition-colors
                  "
                  placeholder="비밀번호를 입력하세요 (최소 8자)"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled
                  className="text-sm text-gray-400 cursor-not-allowed"
                  aria-disabled="true"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={currentState.isLoading}
                whileHover={!currentState.isLoading ? { scale: 1.01 } : {}}
                whileTap={!currentState.isLoading ? { scale: 0.99 } : {}}
                className="
                  w-full py-3 px-4 rounded-lg font-semibold text-white
                  bg-indigo-600 hover:bg-indigo-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
                aria-busy={currentState.isLoading}
              >
                {currentState.isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  '로그인'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Google Login */}
              <motion.button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="
                  w-full py-3 px-4 rounded-lg font-medium
                  bg-white border border-gray-300
                  hover:bg-gray-50 hover:border-gray-400
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  transition-colors
                  flex items-center justify-center gap-3
                "
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700">Google 계정으로 로그인</span>
              </motion.button>

              {/* Kakao Login */}
              <motion.button
                type="button"
                onClick={() => handleSocialLogin('Kakao')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="
                  w-full py-3 px-4 rounded-lg font-medium
                  bg-[#FEE500] hover:bg-[#FDD700]
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                  transition-colors
                  flex items-center justify-center gap-3
                "
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000" aria-hidden="true">
                  <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.726 1.735 5.119 4.35 6.594-.184.672-.6 2.281-.69 2.646-.108.43.158.424.332.308.139-.093 2.158-1.448 3.002-2.025.656.09 1.328.137 2.006.137 5.523 0 10-3.477 10-7.76S17.523 3 12 3z" />
                </svg>
                <span className="text-gray-900">카카오 계정으로 로그인</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* State Info */}
      <div className="max-w-7xl mx-auto p-4 pb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">현재 상태 정보</h3>
          <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto">
            {JSON.stringify(
              {
                state,
                ...currentState,
                formData,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
