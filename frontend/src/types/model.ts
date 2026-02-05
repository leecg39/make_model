// @TASK P2-S1-T1 - AI Model type definitions
// @SPEC specs/domain/resources.yaml#ai_models

export interface ModelImage {
  id: string;
  model_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ModelCreator {
  id: string;
  nickname: string;
  email: string;
}

export interface AIModel {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  style: string | null;
  gender: 'male' | 'female' | 'other' | null;
  age_range: string | null;
  view_count: number;
  rating: number | null;
  status: 'draft' | 'published' | 'archived';
  thumbnail_url: string | null;
  tags: string[];
  images: ModelImage[];
  creator: ModelCreator;
  created_at: string;
  updated_at: string;
}

export interface GetModelsParams {
  sort?: string;
  limit?: number;
  offset?: number;
  status?: 'draft' | 'published' | 'archived';
  creator_id?: string;
}

export interface ModelsResponse {
  items: AIModel[];
  total: number;
  limit: number;
  offset: number;
}
