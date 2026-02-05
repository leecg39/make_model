// @TASK P2-S3-T1 - Favorites API client
// @SPEC Phase 2 Model Profile Screen

import api from './api';
import type { FavoriteModel } from '@/types/model';

export const favoriteService = {
  /**
   * Get user's favorites
   */
  getFavorites: async (): Promise<FavoriteModel[]> => {
    const response = await api.get<FavoriteModel[]>('/api/favorites');
    return response.data;
  },

  /**
   * Add model to favorites
   */
  addFavorite: async (modelId: string): Promise<FavoriteModel> => {
    const response = await api.post<FavoriteModel>('/api/favorites', {
      model_id: modelId,
    });
    return response.data;
  },

  /**
   * Remove model from favorites
   */
  removeFavorite: async (modelId: string): Promise<void> => {
    await api.delete(`/api/favorites/${modelId}`);
  },

  /**
   * Check if model is favorited
   */
  isFavorited: async (modelId: string): Promise<boolean> => {
    try {
      const favorites = await favoriteService.getFavorites();
      return favorites.some((fav) => fav.model_id === modelId);
    } catch {
      return false;
    }
  },
};
