// @TASK P2-S1-T1 - AI Model service (API client)
// @SPEC specs/domain/resources.yaml#ai_models

import api from './api';
import type { AIModel, GetModelsParams, ModelsResponse } from '@/types/model';

/**
 * AI Model API service
 */
class ModelService {
  /**
   * Get AI models with filters
   */
  async getModels(params?: GetModelsParams): Promise<ModelsResponse> {
    const { data } = await api.get<ModelsResponse>('/api/models', { params });
    return data;
  }

  /**
   * Get popular models (sorted by view_count desc, limit 8)
   */
  async getPopularModels(): Promise<AIModel[]> {
    const response = await this.getModels({
      sort: 'view_count:desc',
      limit: 8,
      status: 'published',
    });
    return response.items;
  }

  /**
   * Get recent models (sorted by created_at desc, limit 8)
   */
  async getRecentModels(): Promise<AIModel[]> {
    const response = await this.getModels({
      sort: 'created_at:desc',
      limit: 8,
      status: 'published',
    });
    return response.items;
  }

  /**
   * Get single model by ID
   */
  async getModelById(id: string): Promise<AIModel> {
    const { data } = await api.get<AIModel>(`/api/models/${id}`);
    return data;
  }
}

export const modelService = new ModelService();
