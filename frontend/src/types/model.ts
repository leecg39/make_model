// @TASK P2-S2-T1 - AI Model 타입 정의
// @SPEC docs/planning/domain/resources.yaml - ai_models

export type ModelStyle = 'casual' | 'formal' | 'sporty' | 'street' | 'vintage' | 'editorial';
export type ModelGender = 'female' | 'male' | 'non_binary';
export type ModelAgeRange = '10s' | '20s' | '30s' | '40s_plus';
export type ModelStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Creator {
  id: string;
  display_name: string;
  profile_picture_url?: string;
}

export interface AIModel {
  id: string;
  creator_id: string;
  name: string;
  style: ModelStyle;
  gender: ModelGender;
  age_range: ModelAgeRange;
  view_count: number;
  rating: number;
  status: ModelStatus;
  thumbnail_url: string;
  tags: string[];
  creator?: Creator;
  created_at: string;
}

export interface ModelsQueryParams {
  page?: number;
  limit?: number;
  style?: ModelStyle | '';
  gender?: ModelGender | '';
  age_range?: ModelAgeRange | '';
  keyword?: string;
  sort?: 'recent' | 'popular' | 'rating';
}

export interface ModelsResponse {
  items: AIModel[];
  total: number;
  page: number;
  limit: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  model_id: string;
  created_at: string;
}

export interface FavoritesResponse {
  items: Favorite[];
  total: number;
}
