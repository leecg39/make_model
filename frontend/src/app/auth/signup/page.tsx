// @TASK P1-S2-T1 - 회원가입 화면
// @SPEC docs/planning/03-user-flow.md#회원가입
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">회원가입</h1>
          <p className="text-white/60">Make Model에 오신 것을 환영합니다</p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className={`w-12 h-1 rounded-full transition-colors ${step === 1 ? 'bg-[#c8ff00]' : 'bg-white/20'}`} />
          <div className={`w-12 h-1 rounded-full transition-colors ${step === 2 ? 'bg-[#c8ff00]' : 'bg-white/20'}`} />
        </div>

        {/* 폼 카드 */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-8">
          {step === 1 ? (
            // Step 1: 역할 선택
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-6">역할을 선택해주세요</h2>

              <div className="space-y-4 mb-6">
                {/* 브랜드 카드 */}
                <motion.button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'brand' }))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                    formData.role === 'brand'
                      ? 'border-[#c8ff00] bg-[#c8ff00]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🏢</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">브랜드 (광고주)</h3>
                      <p className="text-sm text-white/60">AI 모델을 탐색하고 섭외하여 마케팅 캠페인을 진행합니다.</p>
                    </div>
                  </div>
                </motion.button>

                {/* 크리에이터 카드 */}
                <motion.button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'creator' }))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                    formData.role === 'creator'
                      ? 'border-[#c8ff00] bg-[#c8ff00]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎨</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">크리에이터 (모델 제작자)</h3>
                      <p className="text-sm text-white/60">AI 모델을 제작하고 판매하여 수익을 창출합니다.</p>
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#c8ff00] text-black py-3 rounded-full font-semibold text-sm hover:bg-[#c8ff00]/90 transition-all"
              >
                다음
              </motion.button>
            </motion.div>
          ) : (
            // Step 2: 정보 입력
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ← 이전
                </button>
                <h2 className="text-xl font-semibold text-white">정보 입력</h2>
                <div className="w-16" /> {/* 균형 맞추기 */}
              </div>

              <div className="space-y-4">
                {/* 이메일 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    이메일
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8ff00] transition-colors"
                      placeholder="example@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {emailCheckLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-[#c8ff00] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p id="email-error" role="alert" className="text-red-400 text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* 비밀번호 */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8ff00] transition-colors"
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
                          'bg-green-500'
                        }`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength === 'medium' || passwordStrength === 'strong' ?
                          (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') :
                          'bg-white/20'
                        }`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength === 'strong' ? 'bg-green-500' : 'bg-white/20'
                        }`} />
                      </div>
                      <p className={`text-xs mt-1 ${
                        passwordStrength === 'weak' ? 'text-red-400' :
                        passwordStrength === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {passwordStrength === 'weak' ? '약함' :
                         passwordStrength === 'medium' ? '보통' : '강함'}
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p id="password-error" role="alert" className="text-red-400 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label htmlFor="passwordConfirm" className="block text-sm font-medium text-white mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    id="passwordConfirm"
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData(prev => ({ ...prev, passwordConfirm: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8ff00] transition-colors"
                    placeholder="비밀번호를 다시 입력하세요"
                    aria-invalid={!!errors.passwordConfirm}
                    aria-describedby={errors.passwordConfirm ? 'passwordConfirm-error' : undefined}
                  />
                  {errors.passwordConfirm && (
                    <p id="passwordConfirm-error" role="alert" className="text-red-400 text-sm mt-1">
                      {errors.passwordConfirm}
                    </p>
                  )}
                </div>

                {/* 닉네임 */}
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-white mb-2">
                    닉네임
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8ff00] transition-colors"
                    placeholder="2-20자"
                    aria-invalid={!!errors.nickname}
                    aria-describedby={errors.nickname ? 'nickname-error' : undefined}
                  />
                  {errors.nickname && (
                    <p id="nickname-error" role="alert" className="text-red-400 text-sm mt-1">
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
                    <label htmlFor="company_name" className="block text-sm font-medium text-white mb-2">
                      회사명 <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="company_name"
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8ff00] transition-colors"
                      placeholder="회사명을 입력하세요"
                      aria-invalid={!!errors.company_name}
                      aria-describedby={errors.company_name ? 'company-error' : undefined}
                    />
                    {errors.company_name && (
                      <p id="company-error" role="alert" className="text-red-400 text-sm mt-1">
                        {errors.company_name}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* API 에러 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* 회원가입 버튼 */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-[#c8ff00] text-black py-3 rounded-full font-semibold text-sm hover:bg-[#c8ff00]/90 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    처리 중...
                  </span>
                ) : (
                  '회원가입'
                )}
              </motion.button>
            </motion.form>
          )}
        </div>

        {/* 로그인 링크 */}
        <p className="text-center text-white/60 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-[#c8ff00] hover:underline">
            로그인
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
