// @TASK P2-S2-T1 + P2-S3-T1 - Favorites API client (merged)
// @SPEC docs/planning/domain/resources.yaml - favorites
import api from './api';
import type { Favorite, FavoritesResponse } from '@/types/model';

export const favoriteService = {
  /**
   * 찜 목록 조회 (인증 필요)
   */
  async getFavorites(): Promise<FavoritesResponse> {
    const { data } = await api.get<FavoritesResponse>('/api/favorites');
    return data;
  },

  /**
   * 찜 추가 (인증 필요)
   */
  async addFavorite(modelId: string): Promise<Favorite> {
    const { data } = await api.post<Favorite>('/api/favorites', { model_id: modelId });
    return data;
  },

  /**
   * 찜 삭제 (인증 필요)
   */
  async removeFavorite(modelId: string): Promise<void> {
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
