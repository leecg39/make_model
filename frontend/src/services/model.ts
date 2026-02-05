// @TASK P2-S2-T1 - Models API 클라이언트
// @SPEC docs/planning/domain/resources.yaml - ai_models
import api from './api';
import type { ModelsQueryParams, ModelsResponse } from '@/types/model';

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
  async getModelById(id: string) {
    const { data } = await api.get(`/api/models/${id}`);
    return data;
  },
};

export default modelService;
