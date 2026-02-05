// @TASK P4-S3-T1 - AI 모델 등록 API 서비스
// @SPEC Phase 4 Model Registration Screen
import api from './api';
import type {
  ModelCreateRequest,
  ImageUploadData,
  AIAnalysisResult,
} from '@/types/model-registration';
import type { AIModel } from '@/types/model';

export const modelRegistrationService = {
  /**
   * 모델 생성 (POST /api/models)
   */
  async createModel(data: ModelCreateRequest): Promise<AIModel> {
    const { data: result } = await api.post<AIModel>('/api/models', data);
    return result;
  },

  /**
   * 모델 이미지 업로드 (POST /api/models/:id/images)
   */
  async uploadImage(
    modelId: string,
    imageData: ImageUploadData
  ): Promise<{ id: string; image_url: string }> {
    const { data: result } = await api.post<{ id: string; image_url: string }>(
      `/api/models/${modelId}/images`,
      imageData
    );
    return result;
  },

  /**
   * AI 이미지 분석 (MVP: 클라이언트 사이드 mock)
   * 실제 AI 분석 API는 향후 백엔드에서 구현 예정
   */
  async analyzeImages(_imageUrls: string[]): Promise<AIAnalysisResult> {
    // MVP: 클라이언트 사이드 mock
    // 실제로는 POST /api/models/analyze-images { image_urls: [...] }
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5초 지연

    // Mock 분석 결과
    const mockStyles = ['casual', 'formal', 'sporty', 'street', 'vintage', 'editorial'];
    const mockTags = [
      'natural',
      'fresh',
      'elegant',
      'modern',
      'minimalist',
      'dynamic',
      'professional',
      'youthful',
    ];

    const randomStyle = mockStyles[Math.floor(Math.random() * mockStyles.length)];
    const selectedTags = mockTags
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 3)); // 3~5개

    return {
      style: randomStyle,
      tags: selectedTags,
      description: `AI가 분석한 ${randomStyle} 스타일의 모델입니다. ${selectedTags.slice(0, 2).join(', ')} 느낌이 특징입니다.`,
    };
  },
};

export default modelRegistrationService;
