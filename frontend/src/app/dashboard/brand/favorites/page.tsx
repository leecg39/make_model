// Brand Dashboard - 찜 목록 페이지
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardNav } from '@/components/brand/DashboardNav';
import { ModelGrid } from '@/components/explore/ModelGrid';
import { useAuthStore } from '@/stores/auth';
import { useFavorites } from '@/hooks/useFavorites';

const queryClient = new QueryClient();

function FavoritesContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { favorites, favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'brand') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'brand') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <DashboardNav />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">찜 목록</h1>
            <p className="text-white/50">관심있는 모델을 관리하세요</p>
          </header>

          {favorites.length === 0 ? (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-white/50 mb-4">아직 찜한 모델이 없습니다</p>
              <button
                onClick={() => router.push('/explore')}
                className="px-6 py-3 bg-[#E882B2] text-black rounded-lg font-semibold hover:bg-[#f598c4] transition-colors"
              >
                모델 탐색하기
              </button>
            </div>
          ) : (
            <ModelGrid
              models={favorites.map((fav) => fav.model).filter((m): m is NonNullable<typeof m> => !!m)}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function BrandFavoritesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesContent />
    </QueryClientProvider>
  );
}
