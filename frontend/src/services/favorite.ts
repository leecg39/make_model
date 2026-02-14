// @TASK P2-S2-T1 + P2-S3-T1 - Favorites API client (merged)
// @SPEC docs/planning/domain/resources.yaml - favorites
import api from './api';
import { isMockAuthMode } from '@/lib/auth-mode';
import type { Favorite, FavoritesResponse } from '@/types/model';

const MOCK_FAVORITES_STORAGE_KEY = 'mock-favorites';

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) {
    return null;
  }

  try {
    const parsed = JSON.parse(authStorage);
    const userId = parsed?.state?.user?.id;
    return typeof userId === 'string' ? userId : null;
  } catch {
    return null;
  }
}

function readMockFavorites(): Record<string, Favorite[]> {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = localStorage.getItem(MOCK_FAVORITES_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeMockFavorites(favoritesByUser: Record<string, Favorite[]>): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(MOCK_FAVORITES_STORAGE_KEY, JSON.stringify(favoritesByUser));
}

export const favoriteService = {
  /**
   * 찜 목록 조회 (인증 필요)
   */
  async getFavorites(): Promise<FavoritesResponse> {
    if (isMockAuthMode()) {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const favoritesByUser = readMockFavorites();
      const items = favoritesByUser[userId] || [];
      return { items, total: items.length };
    }

    const { data } = await api.get<FavoritesResponse>('/api/favorites');
    return data;
  },

  /**
   * 찜 추가 (인증 필요)
   */
  async addFavorite(modelId: string): Promise<Favorite> {
    if (isMockAuthMode()) {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const favoritesByUser = readMockFavorites();
      const currentFavorites = favoritesByUser[userId] || [];
      const existing = currentFavorites.find((favorite) => favorite.model_id === modelId);
      if (existing) {
        return existing;
      }

      const newFavorite: Favorite = {
        id: `fav-${Date.now()}`,
        user_id: userId,
        model_id: modelId,
        created_at: new Date().toISOString(),
      };

      favoritesByUser[userId] = [newFavorite, ...currentFavorites];
      writeMockFavorites(favoritesByUser);
      return newFavorite;
    }

    const { data } = await api.post<Favorite>('/api/favorites', { model_id: modelId });
    return data;
  },

  /**
   * 찜 삭제 (인증 필요)
   */
  async removeFavorite(modelId: string): Promise<void> {
    if (isMockAuthMode()) {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const favoritesByUser = readMockFavorites();
      const currentFavorites = favoritesByUser[userId] || [];
      favoritesByUser[userId] = currentFavorites.filter((favorite) => favorite.model_id !== modelId);
      writeMockFavorites(favoritesByUser);
      return;
    }

    await api.delete(`/api/favorites/${modelId}`);
  },

  /**
   * 찜 여부 확인
   */
  async isFavorited(modelId: string): Promise<boolean> {
    try {
      const { items } = await favoriteService.getFavorites();
      return items.some((fav) => fav.model_id === modelId);
    } catch {
      return false;
    }
  },
};

export default favoriteService;
