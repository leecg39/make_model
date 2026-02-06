// @TASK P1-S2-T1 - Signup page with social login (ourcovers-inspired redesign)
// @SPEC Phase 1 Signup Screen
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import Link from 'next/link';

type Role = 'brand' | 'creator';

interface SignupFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  role: Role | null;
  company_name: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  nickname?: string;
  company_name?: string;
  role?: string;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

export default function SignupPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, user } = useAuthStore();
  const { addToast } = useUIStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    role: null,
    company_name: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailDebounceTimer, setEmailDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 인증된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (user) {
      if (user.role === 'brand') {
        router.push('/dashboard/brand');
      } else if (user.role === 'creator') {
        router.push('/dashboard/creator');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  // 비밀번호 강도 계산
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length < 8) return 'weak';

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

    if (criteriaCount >= 3 && password.length >= 12) return 'strong';
    if (criteriaCount >= 2 && password.length >= 8) return 'medium';
    return 'weak';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // 이메일 중복 검사 (debounce 300ms)
  const checkEmailDuplicate = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setEmailCheckLoading(true);
    try {
      // TODO: 실제 API 호출
      // const response = await fetch(`/api/v1/auth/check-email?email=${email}`);
      // const data = await response.json();

      // 임시: 300ms 후 통과
      await new Promise(resolve => setTimeout(resolve, 300));

      setErrors(prev => ({ ...prev, email: undefined }));
    } catch (err) {
      setErrors(prev => ({ ...prev, email: '이메일 중복 확인에 실패했습니다.' }));
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));

    // 기존 타이머 제거
    if (emailDebounceTimer) {
      clearTimeout(emailDebounceTimer);
    }

    // 300ms 후 중복 검사
    const timer = setTimeout(() => {
      checkEmailDuplicate(email);
    }, 300);

    setEmailDebounceTimer(timer);
  };

  // 유효성 검증
  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.role) {
      newErrors.role = '역할을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};

    // 이메일
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.';
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // 닉네임
    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = '닉네임은 2-20자 사이여야 합니다.';
    }

    // 회사명 (brand 역할일 때만)
    if (formData.role === 'brand' && !formData.company_name) {
      newErrors.company_name = '회사명을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    clearError();

    try {
      await register({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        role: formData.role!,
        company_name: formData.role === 'brand' ? formData.company_name : undefined,
      });

      // 성공 시 자동 로그인 후 리다이렉트 (useEffect에서 처리)
    } catch (err) {
      // 에러는 store에서 처리
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    addToast({
      variant: 'info',
      message: `${provider === 'google' ? 'Google' : 'Kakao'} 회원가입 준비 중입니다`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E882B2] rounded-full filter blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#E882B2] rounded-full filter blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-bold">
              <span className="text-white">MAKE</span>
              <span className="text-[#E882B2]"> MODEL</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">회원가입</h1>
          <p className="text-sm text-white/50">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-[#E882B2] hover:text-[#f598c4] transition-colors"
            >
              로그인하기
            </Link>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 gap-2">
          <div className={`w-16 h-1 rounded-full transition-colors ${step === 1 ? 'bg-[#E882B2]' : 'bg-white/20'}`} />
          <div className={`w-16 h-1 rounded-full transition-colors ${step === 2 ? 'bg-[#E882B2]' : 'bg-white/20'}`} />
        </div>

        {/* Signup Card */}
        <div className="bg-[#111] rounded-2xl border border-white/10 p-8 backdrop-blur-sm">
          {step === 1 ? (
            // Step 1: 역할 선택
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-white mb-6">역할을 선택해주세요</h2>

              <div className="space-y-4 mb-6">
                {/* 브랜드 카드 */}
                <motion.button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'brand' }))}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    formData.role === 'brand'
                      ? 'border-[#E882B2] bg-[#E882B2]/10'
                      : 'border-white/10 hover:border-white/20 bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E882B2]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#E882B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">브랜드 (광고주)</h3>
                      <p className="text-sm text-white/50">AI 모델을 탐색하고 섭외하여 마케팅 캠페인을 진행합니다.</p>
                    </div>
                  </div>
                </motion.button>

                {/* 크리에이터 카드 */}
                <motion.button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'creator' }))}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    formData.role === 'creator'
                      ? 'border-[#E882B2] bg-[#E882B2]/10'
                      : 'border-white/10 hover:border-white/20 bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E882B2]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#E882B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">크리에이터 (모델 제작자)</h3>
                      <p className="text-sm text-white/50">AI 모델을 제작하고 판매하여 수익을 창출합니다.</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {errors.role && (
                <p className="text-red-400 text-sm mb-4">{errors.role}</p>
              )}

              <motion.button
                type="button"
                onClick={handleStep1Next}
                disabled={!formData.role}
                whileHover={formData.role ? { scale: 1.02, boxShadow: '0 0 30px rgba(232, 130, 178, 0.3)' } : {}}
                whileTap={formData.role ? { scale: 0.98 } : {}}
                className="
                  w-full py-3.5 px-4 rounded-lg font-semibold text-black
                  bg-[#E882B2] hover:bg-[#f598c4]
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-[#E882B2]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                "
              >
                다음 단계
              </motion.button>
            </motion.div>
          ) : (
            // Step 2: 정보 입력
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-white/50 hover:text-[#E882B2] transition-colors text-sm"
                >
                  ← 이전
                </button>
                <span className="text-sm text-white/50">
                  {formData.role === 'brand' ? '브랜드' : '크리에이터'} 가입
                </span>
              </div>

              {/* Global Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg bg-red-500/10 border border-red-500/30 p-4"
                >
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </motion.div>
              )}

              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                  이메일
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-lg border transition-all duration-200
                      bg-[#1a1a1a] text-white placeholder-white/30
                      focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent
                      ${errors.email ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'}
                    `}
                    placeholder="example@email.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {emailCheckLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-[#E882B2] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`
                    w-full px-4 py-3 rounded-lg border transition-all duration-200
                    bg-[#1a1a1a] text-white placeholder-white/30
                    focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent
                    ${errors.password ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'}
                  `}
                  placeholder="최소 8자, 영문+숫자"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                />

                {/* 비밀번호 강도 바 */}
                {formData.password && (
                  <div id="password-strength" className="mt-2">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === 'weak' ? 'bg-red-500' :
                        passwordStrength === 'medium' ? 'bg-yellow-500' :
                        'bg-[#E882B2]'
                      }`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === 'medium' || passwordStrength === 'strong' ?
                        (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-[#E882B2]') :
                        'bg-white/20'
                      }`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === 'strong' ? 'bg-[#E882B2]' : 'bg-white/20'
                      }`} />
                    </div>
                    <p className={`text-xs mt-1 ${
                      passwordStrength === 'weak' ? 'text-red-400' :
                      passwordStrength === 'medium' ? 'text-yellow-400' :
                      'text-[#E882B2]'
                    }`}>
                      {passwordStrength === 'weak' ? '약함' :
                       passwordStrength === 'medium' ? '보통' : '강함'}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1.5 text-xs text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-white/70 mb-1.5">
                  비밀번호 확인
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData(prev => ({ ...prev, passwordConfirm: e.target.value }))}
                  className={`
                    w-full px-4 py-3 rounded-lg border transition-all duration-200
                    bg-[#1a1a1a] text-white placeholder-white/30
                    focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent
                    ${errors.passwordConfirm ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'}
                  `}
                  placeholder="비밀번호를 다시 입력하세요"
                  aria-invalid={!!errors.passwordConfirm}
                  aria-describedby={errors.passwordConfirm ? 'passwordConfirm-error' : undefined}
                />
                {errors.passwordConfirm && (
                  <p id="passwordConfirm-error" role="alert" className="mt-1.5 text-xs text-red-400">
                    {errors.passwordConfirm}
                  </p>
                )}
              </div>

              {/* 닉네임 */}
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-white/70 mb-1.5">
                  닉네임
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  className={`
                    w-full px-4 py-3 rounded-lg border transition-all duration-200
                    bg-[#1a1a1a] text-white placeholder-white/30
                    focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent
                    ${errors.nickname ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'}
                  `}
                  placeholder="2-20자"
                  aria-invalid={!!errors.nickname}
                  aria-describedby={errors.nickname ? 'nickname-error' : undefined}
                />
                {errors.nickname && (
                  <p id="nickname-error" role="alert" className="mt-1.5 text-xs text-red-400">
                    {errors.nickname}
                  </p>
                )}
              </div>

              {/* 회사명 (brand 역할일 때만) */}
              {formData.role === 'brand' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label htmlFor="company_name" className="block text-sm font-medium text-white/70 mb-1.5">
                    회사명 <span className="text-[#E882B2]">*</span>
                  </label>
                  <input
                    id="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className={`
                      w-full px-4 py-3 rounded-lg border transition-all duration-200
                      bg-[#1a1a1a] text-white placeholder-white/30
                      focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent
                      ${errors.company_name ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'}
                    `}
                    placeholder="회사명을 입력하세요"
                    aria-invalid={!!errors.company_name}
                    aria-describedby={errors.company_name ? 'company-error' : undefined}
                  />
                  {errors.company_name && (
                    <p id="company-error" role="alert" className="mt-1.5 text-xs text-red-400">
                      {errors.company_name}
                    </p>
                  )}
                </motion.div>
              )}

              {/* 회원가입 버튼 */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 0 30px rgba(232, 130, 178, 0.3)' } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="
                  w-full py-3.5 px-4 rounded-lg font-semibold text-black
                  bg-[#E882B2] hover:bg-[#f598c4]
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-[#E882B2]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                "
                aria-busy={isLoading}
              >
                {isLoading ? (
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
                    가입 중...
                  </span>
                ) : (
                  '회원가입'
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#111] text-white/40">또는</span>
                </div>
              </div>

              {/* Social Signup Buttons */}
              <div className="space-y-3">
                {/* Google */}
                <motion.button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="
                    w-full py-3 px-4 rounded-lg font-medium
                    bg-white hover:bg-gray-100
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-gray-500
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
                  <span className="text-gray-700">Google 계정으로 가입</span>
                </motion.button>

                {/* Kakao */}
                <motion.button
                  type="button"
                  onClick={() => handleSocialLogin('kakao')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="
                    w-full py-3 px-4 rounded-lg font-medium
                    bg-[#FEE500] hover:bg-[#FDD700]
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-yellow-500
                    transition-colors
                    flex items-center justify-center gap-3
                  "
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000" aria-hidden="true">
                    <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.726 1.735 5.119 4.35 6.594-.184.672-.6 2.281-.69 2.646-.108.43.158.424.332.308.139-.093 2.158-1.448 3.002-2.025.656.09 1.328.137 2.006.137 5.523 0 10-3.477 10-7.76S17.523 3 12 3z" />
                  </svg>
                  <span className="text-gray-900">카카오 계정으로 가입</span>
                </motion.button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-white/40 hover:text-[#E882B2] transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
