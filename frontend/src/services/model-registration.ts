// @TASK P4-S3-T1 - AI 모델 등록 API 서비스
// @SPEC Phase 4 Model Registration Screen
import api from './api';
import { isMockAuthMode } from '@/lib/auth-mode';
import { upsertStoredMockModel, updateStoredMockModelImage } from '@/lib/mock-model-store';
import type {
  ModelCreateRequest,
  ImageUploadData,
  AIAnalysisResult,
  ZaiGenerationRequest,
  ZaiGenerationResult,
} from '@/types/model-registration';
import type { AIModel } from '@/types/model';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

function readCurrentUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem('auth-storage');
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.user || null;
  } catch {
    return null;
  }
}

function shouldUseMockMode(): boolean {
  return USE_MOCK || isMockAuthMode();
}

function buildMockModel(data: ModelCreateRequest): AIModel {
  const user = readCurrentUser();
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  if (user.role !== 'creator') {
    throw new Error('크리에이터 계정만 모델 등록이 가능합니다.');
  }

  const now = new Date().toISOString();
  return {
    id: `m${crypto.randomUUID()}`,
    creator_id: user.id,
    name: data.name,
    description: data.description || '',
    style: data.style,
    gender: data.gender,
    age_range: data.age_range,
    view_count: 0,
    rating: null,
    status: data.status,
    thumbnail_url: null,
    tags: data.tags || [],
    images: [],
    creator: {
      id: user.id,
      email: user.email,
      nickname: user.nickname || user.name || 'Creator',
      profile_image: null,
    },
    created_at: now,
    updated_at: now,
  };
}

export const modelRegistrationService = {
  async createModel(data: ModelCreateRequest): Promise<AIModel> {
    if (shouldUseMockMode()) {
      const model = buildMockModel(data);
      upsertStoredMockModel(model);
      return model;
    }

    const { data: result } = await api.post<AIModel>('/api/models', data);
    return result;
  },

  async uploadImage(
    modelId: string,
    imageData: ImageUploadData
  ): Promise<{ id: string; image_url: string }> {
    if (shouldUseMockMode()) {
      const image = updateStoredMockModelImage(
        modelId,
        imageData.file_url,
        imageData.display_order,
        imageData.is_thumbnail
      );
      return { id: image.id, image_url: image.image_url };
    }

    const { data: result } = await api.post<{ id: string; image_url: string }>(
      `/api/models/${modelId}/images`,
      imageData
    );
    return result;
  },

  async analyzeImages(_imageUrls: string[]): Promise<AIAnalysisResult> {
    await new Promise((resolve) => setTimeout(resolve, 1200));
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
      .slice(0, 3 + Math.floor(Math.random() * 3));

    return {
      style: randomStyle,
      tags: selectedTags,
      description: `AI가 분석한 ${randomStyle} 스타일의 모델입니다. ${selectedTags.slice(0, 2).join(', ')} 느낌이 특징입니다.`,
    };
  },

  async generateImage(request: ZaiGenerationRequest): Promise<ZaiGenerationResult> {
    const response = await fetch('/api/ai/zai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    let payload: { error?: string; url?: string; created?: number; fallback?: boolean; warning?: string };
    try {
      payload = (await response.json()) as {
        error?: string;
        url?: string;
        created?: number;
        fallback?: boolean;
        warning?: string;
      };
    } catch {
      payload = {};
    }

    if (!response.ok || !payload.url) {
      throw new Error(payload.error || `이미지 생성에 실패했습니다. (${response.status})`);
    }

    return {
      url: payload.url,
      created: payload.created || Math.floor(Date.now() / 1000),
      fallback: payload.fallback,
      warning: payload.warning,
    };
  },
};

export default modelRegistrationService;
