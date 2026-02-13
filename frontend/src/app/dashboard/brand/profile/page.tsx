// Brand Dashboard - 프로필 설정 페이지
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth';
import { DashboardNav } from '@/components/brand/DashboardNav';

export default function BrandProfilePage() {
  const router = useRouter();
  const { user, token, logout, fetchUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    } else if (user && user.role !== 'brand') {
      router.push('/');
    }
  }, [token, user, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        nickname: user.nickname || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.updateProfile({ name: formData.name });
      await fetchUser();
      setIsEditing(false);
      setMessage({ type: 'success', text: '프로필이 업데이트되었습니다' });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error as Error).message || '프로필 업데이트에 실패했습니다' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 최소 8자 이상이어야 합니다' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다' });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error as Error).message || '비밀번호 변경에 실패했습니다' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (!token || (user && user.role !== 'brand')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardNav />

      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">프로필 설정</h1>
          <p className="text-white/50 mb-8">계정 정보를 관리하세요</p>

          {message.text && (
            <div
              className={`mb-6 rounded-lg p-4 border ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Account Info */}
          <div className="bg-[#111] rounded-xl border border-white/10 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">계정 정보</h2>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
                    이름
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-[#E882B2] text-black rounded-lg font-semibold hover:bg-[#f598c4] disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? '저장 중...' : '저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/50">이메일</label>
                  <p className="mt-1 text-white">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-white/50">이름</label>
                  <p className="mt-1 text-white">{user?.name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm text-white/50">닉네임</label>
                  <p className="mt-1 text-white">{user?.nickname || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm text-white/50">역할</label>
                  <p className="mt-1 text-white">
                    <span className="inline-block px-3 py-1 bg-[#E882B2]/20 text-[#E882B2] rounded-full text-sm">
                      브랜드
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-white/50">가입일</label>
                  <p className="mt-1 text-white">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  프로필 수정
                </button>
              </div>
            )}
          </div>

          {/* Security */}
          <div className="bg-[#111] rounded-xl border border-white/10 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">보안</h2>

            {isChangingPassword ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-white/70 mb-1.5">
                    현재 비밀번호
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-white/70 mb-1.5">
                    새 비밀번호
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-1.5">
                    새 비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-[#E882B2] focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-[#E882B2] text-black rounded-lg font-semibold hover:bg-[#f598c4] disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? '변경 중...' : '비밀번호 변경'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                비밀번호 변경
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="bg-[#111] rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">계정</h2>
            <button
              onClick={handleLogout}
              className="w-full px-5 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
