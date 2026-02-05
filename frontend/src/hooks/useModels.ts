// @TASK P2-S2-T1 - 모델 목록 커스텀 훅 (필터, 페이지네이션, 정렬)
// @SPEC docs/planning/domain/resources.yaml - ai_models
'use client';

import { useQuery } from '@tanstack/react-query';
import { modelService } from '@/services/model';
import type { ModelsQueryParams } from '@/types/model';

export function useModels(params: ModelsQueryParams = {}) {
  return useQuery({
    queryKey: ['models', params],
    queryFn: () => modelService.getModels(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}
