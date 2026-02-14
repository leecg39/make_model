// @TASK P2-S2-T1 + P2-S3-T1 - Models API client (merged)
// @SPEC docs/planning/domain/resources.yaml - ai_models
import api from './api';
import type { AIModel, ModelsQueryParams, ModelsResponse } from '@/types/model';
import { getStoredMockModels } from '@/lib/mock-model-store';
import {
  getMockModelById,
  MOCK_AI_MODELS,
} from '@/mocks/models';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

function getMergedMockModels(): AIModel[] {
  const storedModels = getStoredMockModels();
  return [...storedModels, ...MOCK_AI_MODELS.filter((item) => !storedModels.some((stored) => stored.id === item.id))];
}

function applyMockFilters(models: AIModel[], params: ModelsQueryParams): AIModel[] {
  const keyword = params.keyword?.toLowerCase();

  return models.filter((model) => {
    if (params.style && model.style !== params.style) {
      return false;
    }
    if (params.gender && model.gender !== params.gender) {
      return false;
    }
    if (params.age_range && model.age_range !== params.age_range) {
      return false;
    }
    if (keyword) {
      const match =
        model.name.toLowerCase().includes(keyword) ||
        model.description?.toLowerCase().includes(keyword) ||
        model.tags?.some((tag) => tag.toLowerCase().includes(keyword));
      if (!match) {
        return false;
      }
    }
    return true;
  });
}

function applyMockSort(models: AIModel[], sort?: string): AIModel[] {
  if (!sort) {
    return models;
  }

  const [field, direction] = sort.split(':');
  const order = direction === 'asc' ? 1 : -1;
  const sorted = [...models];

  sorted.sort((a, b) => {
    if (field === 'view_count') {
      return (a.view_count - b.view_count) * order;
    }
    if (field === 'created_at') {
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * order;
    }
    if (field === 'rating') {
      return ((a.rating || 0) - (b.rating || 0)) * order;
    }
    return 0;
  });

  return sorted;
}

export const modelService = {
  /**
   * 모델 목록 조회 (필터, 검색, 페이지네이션, 정렬)
   */
  async getModels(params: ModelsQueryParams = {}): Promise<ModelsResponse> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      const page = params.page || 1;
      const limit = params.limit || 12;
      const offset = (page - 1) * limit;
      const filtered = applyMockFilters(getMergedMockModels(), params);
      const sorted = applyMockSort(filtered, params.sort);
      return {
        items: sorted.slice(offset, offset + limit),
        total: sorted.length,
        page,
        limit,
        offset,
      };
    }

    const queryParams = new URLSearchParams();

    // 기본값 설정
    queryParams.append('page', String(params.page || 1));
    queryParams.append('limit', String(params.limit || 12));

    // 필터 파라미터
    if (params.style) queryParams.append('style', params.style);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.age_range) queryParams.append('age_range', params.age_range);
    if (params.status) queryParams.append('status', params.status);

    // 검색 키워드
    if (params.keyword) queryParams.append('keyword', params.keyword);

    // 정렬
    if (params.sort) queryParams.append('sort', params.sort);

    const { data } = await api.get<ModelsResponse>(`/api/models?${queryParams.toString()}`);
    return data;
  },

  /**
   * 모델 상세 조회
   */
  async getModelById(id: string): Promise<AIModel> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 150));
      const model = getMergedMockModels().find((item) => item.id === id) || getMockModelById(id);
      if (!model) throw new Error('모델을 찾을 수 없습니다');
      return model;
    }

    const { data } = await api.get<AIModel>(`/api/models/${id}`);
    return data;
  },

  /**
   * 인기 모델 목록 (조회수 내림차순)
   */
  async getPopularModels(): Promise<AIModel[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return [...getMergedMockModels()].sort((a, b) => b.view_count - a.view_count).slice(0, 8);
    }

    const response = await this.getModels({ sort: 'view_count:desc', limit: 8, status: 'published' });
    return response.items;
  },

  /**
   * 최신 모델 목록 (등록일 내림차순)
   */
  async getRecentModels(): Promise<AIModel[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return [...getMergedMockModels()]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);
    }

    const response = await this.getModels({ sort: 'created_at:desc', limit: 8, status: 'published' });
    return response.items;
  },

  /**
   * 조회수 증가
   */
  async incrementViewCount(id: string): Promise<void> {
    if (USE_MOCK) return;
    await api.post(`/api/models/${id}/views`);
  },
};

export default modelService;
