// @TASK P2-S3-T1 - Models API client
// @SPEC Phase 2 Model Profile Screen

import api from './api';
import type { AIModel } from '@/types/model';

export const modelService = {
  /**
   * Get model by ID
   */
  getModelById: async (id: string): Promise<AIModel> => {
    const response = await api.get<AIModel>(`/api/models/${id}`);
    return response.data;
  },

  /**
   * Increment view count
   */
  incrementViewCount: async (id: string): Promise<void> => {
    await api.post(`/api/models/${id}/views`);
  },
};
