// @TASK P2-S2-T1 - 찜 관리 커스텀 훅
// @SPEC docs/planning/domain/resources.yaml - favorites
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '@/services/favorite';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

export function useFavorites() {
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteService.getFavorites(),
    enabled: !!user, // 로그인 시에만 조회
    staleTime: 1000 * 60 * 5, // 5분
  });

  const addMutation = useMutation({
    mutationFn: (modelId: string) => favoriteService.addFavorite(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      addToast({ variant: 'success', message: '찜 목록에 추가되었습니다.' });
    },
    onError: () => {
      addToast({ variant: 'error', message: '찜 추가에 실패했습니다.' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (modelId: string) => favoriteService.removeFavorite(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      addToast({ variant: 'success', message: '찜 목록에서 제거되었습니다.' });
    },
    onError: () => {
      addToast({ variant: 'error', message: '찜 제거에 실패했습니다.' });
    },
  });

  const favoriteIds = new Set(data?.items.map((fav) => fav.model_id) || []);

  const toggleFavorite = (modelId: string) => {
    if (favoriteIds.has(modelId)) {
      removeMutation.mutate(modelId);
    } else {
      addMutation.mutate(modelId);
    }
  };

  return {
    favorites: data?.items || [],
    favoriteIds,
    toggleFavorite,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
