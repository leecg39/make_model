// @TASK P2-S2-T1 + P2-S3-T1 - Models API client (merged)
// @SPEC docs/planning/domain/resources.yaml - ai_models
import api from './api';
import type { AIModel, ModelsQueryParams, ModelsResponse } from '@/types/model';
import {
  getMockModelsResponse,
  getMockModelById,
  getPopularMockModels,
  getRecentMockModels,
} from '@/mocks/models';

// Mock 모드: 백엔드 없이 Mock 데이터 사용
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true; // 기본값 true

export const modelService = {
  /**
   * 모델 목록 조회 (필터, 검색, 페이지네이션, 정렬)
   */
  async getModels(params: ModelsQueryParams = {}): Promise<ModelsResponse> {
    // Mock 모드
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300)); // 네트워크 지연 시뮬레이션
      return getMockModelsResponse(params.page || 1, params.limit || 12, {
        style: params.style,
        gender: params.gender,
        age_range: params.age_range,
        keyword: params.keyword,
      });
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
    // Mock 모드
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      const model = getMockModelById(id);
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
    // Mock 모드
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return getPopularMockModels(8);
    }

    const response = await this.getModels({ sort: 'view_count:desc', limit: 8, status: 'published' });
    return response.items;
  },

  /**
   * 최신 모델 목록 (등록일 내림차순)
   */
  async getRecentModels(): Promise<AIModel[]> {
    // Mock 모드
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return getRecentMockModels(8);
    }

    const response = await this.getModels({ sort: 'created_at:desc', limit: 8, status: 'published' });
    return response.items;
  },

  /**
   * 조회수 증가
   */
  async incrementViewCount(id: string): Promise<void> {
    if (USE_MOCK) return; // Mock 모드에서는 무시
    await api.post(`/api/models/${id}/views`);
  },
};

export default modelService;
