// @TASK P2-S2-T1 - Favorites API 클라이언트
// @SPEC docs/planning/domain/resources.yaml - favorites
import api from './api';
import type { FavoritesResponse } from '@/types/model';

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
  async addFavorite(modelId: string): Promise<void> {
    await api.post('/api/favorites', { model_id: modelId });
  },

  /**
   * 찜 삭제 (인증 필요)
   */
  async removeFavorite(modelId: string): Promise<void> {
    await api.delete(`/api/favorites/${modelId}`);
  },
};

export default favoriteService;
