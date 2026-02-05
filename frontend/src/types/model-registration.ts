// @TASK P4-S3-T1 - AI 모델 등록 타입 정의
// @SPEC Phase 4 Model Registration Screen

import type { ModelStyle, ModelGender, ModelAgeRange } from './model';

/**
 * 모델 등록 요청 (POST /api/models)
 */
export interface ModelCreateRequest {
  name: string;
  description?: string;
  style: ModelStyle | string;
  gender: ModelGender | string;
  age_range: ModelAgeRange | string;
  tags?: string[];
  status: 'draft' | 'active';
}

/**
 * 이미지 업로드 데이터
 */
export interface ImageUploadData {
  file_url: string;
  display_order: number;
  is_thumbnail: boolean;
}

/**
 * AI 분석 결과
 */
export interface AIAnalysisResult {
  style: ModelStyle | string;
  tags: string[];
  description: string;
}

/**
 * 이미지 미리보기 아이템
 */
export interface ImagePreviewItem {
  id: string; // 로컬 임시 ID
  file: File;
  preview: string; // data URL
  display_order: number;
  is_thumbnail: boolean;
}
