// @TASK P2-S2-T1 + P2-S3-T1 - Models API client (merged)
// @SPEC docs/planning/domain/resources.yaml - ai_models
import api from './api';
import type { AIModel, ModelsQueryParams, ModelsResponse } from '@/types/model';

export const modelService = {
  /**
   * 모델 목록 조회 (필터, 검색, 페이지네이션, 정렬)
   */
  async getModels(params: ModelsQueryParams = {}): Promise<ModelsResponse> {
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
    const { data } = await api.get<AIModel>(`/api/models/${id}`);
    return data;
  },

  /**
   * 인기 모델 목록 (조회수 내림차순)
   */
  async getPopularModels(): Promise<ModelsResponse> {
    return this.getModels({ sort: 'view_count:desc', limit: 8, status: 'published' });
  },

  /**
   * 최신 모델 목록 (등록일 내림차순)
   */
  async getRecentModels(): Promise<ModelsResponse> {
    return this.getModels({ sort: 'created_at:desc', limit: 8, status: 'published' });
  },

  /**
   * 조회수 증가
   */
  async incrementViewCount(id: string): Promise<void> {
    await api.post(`/api/models/${id}/views`);
  },
};

export default modelService;
