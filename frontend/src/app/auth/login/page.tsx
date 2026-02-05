// @TASK P1-S1-T1 - Login page with social login
// @SPEC Phase 1 Login Screen
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user } = useAuthStore();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      errors.email = '이메일을 입력하세요';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = '비밀번호를 입력하세요';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = '비밀번호는 최소 8자 이상이어야 합니다';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);

      // Role-based redirect
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'brand') {
        router.push('/dashboard/brand');
      } else if (currentUser?.role === 'creator') {
        router.push('/dashboard/creator');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      // Error is handled by store
      console.error('Login error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    addToast({
      variant: 'info',
      message: `${provider === 'google' ? 'Google' : 'Kakao'} 로그인 준비 중입니다`,
    });
  };

  return (
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
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4"
            >
              <p className="text-sm text-red-800 font-medium">{error}</p>
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
                className={`
                  w-full px-4 py-2.5 rounded-lg border transition-colors
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                `}
                placeholder="이메일을 입력하세요"
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? 'email-error' : undefined}
              />
              {formErrors.email && (
                <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-600">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                className={`
                  w-full px-4 py-2.5 rounded-lg border transition-colors
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  ${formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                `}
                placeholder="비밀번호를 입력하세요 (최소 8자)"
                aria-invalid={!!formErrors.password}
                aria-describedby={formErrors.password ? 'password-error' : undefined}
              />
              {formErrors.password && (
                <p id="password-error" role="alert" className="mt-1.5 text-xs text-red-600">
                  {formErrors.password}
                </p>
              )}
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
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
              className="
                w-full py-3 px-4 rounded-lg font-semibold text-white
                bg-indigo-600 hover:bg-indigo-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
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
              onClick={() => handleSocialLogin('google')}
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
              onClick={() => handleSocialLogin('kakao')}
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
  );
}
