'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authLib } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const refreshToken = searchParams.get('refresh_token');
  const errorParam = searchParams.get('error');
  const initialError = errorParam
    ? '소셜 로그인에 실패했습니다. 다시 시도해주세요.'
    : !token
      ? '인증 토큰이 없습니다.'
      : null;
  const [error, setError] = useState<string | null>(initialError);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (initialError || !token) {
      setTimeout(() => router.push('/auth/login'), 2000);
      return;
    }

    // Store tokens
    authLib.setToken(token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    // Fetch user and redirect based on role
    fetchUser().then(() => {
      const state = useAuthStore.getState();
      const user = state.user;
      if (user?.role === 'brand') {
        router.push('/dashboard/brand');
      } else if (user?.role === 'creator') {
        router.push('/dashboard/creator');
      } else {
        router.push('/');
      }
    }).catch(() => {
      setError('사용자 정보를 불러오지 못했습니다.');
      setTimeout(() => router.push('/auth/login'), 2000);
    });
  }, [initialError, token, refreshToken, router, fetchUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <p className="text-gray-500 mt-2">로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4" />
        <p className="text-gray-300 text-lg">로그인 처리 중...</p>
      </div>
    </div>
  );
}
