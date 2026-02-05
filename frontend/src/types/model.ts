// @TASK P2-S2-T1 + P2-S3-T1 - AI Model type definitions (merged)
// @SPEC docs/planning/domain/resources.yaml - ai_models

export type ModelStyle = 'casual' | 'formal' | 'sporty' | 'street' | 'vintage' | 'editorial';
export type ModelGender = 'female' | 'male' | 'non_binary' | 'other';
export type ModelAgeRange = '10s' | '20s' | '30s' | '40s_plus';
export type ModelStatus = 'draft' | 'active' | 'published' | 'paused' | 'archived';

export interface ModelImage {
  id: string;
  model_id: string;
  image_url: string;
  display_order: number;
  is_thumbnail: boolean;
  created_at: string;
}

export interface ModelCreator {
  id: string;
  email: string;
  nickname: string | null;
  profile_image: string | null;
}

export interface Creator {
  id: string;
  display_name: string;
  profile_picture_url?: string;
}

export interface AIModel {
  id: string;
  creator_id: string;
  name: string;
  description?: string | null;
  style: string | null;
  gender: string | null;
  age_range: string | null;
  view_count: number;
  rating: number | null;
  status: string;
  thumbnail_url: string | null;
  tags: string[] | null;
  images?: ModelImage[];
  creator?: ModelCreator | Creator;
  created_at: string;
  updated_at?: string;
}

export interface ModelsQueryParams {
  page?: number;
  limit?: number;
  style?: ModelStyle | string;
  gender?: ModelGender | string;
  age_range?: ModelAgeRange | string;
  keyword?: string;
  sort?: string;
  status?: string;
}

export interface ModelsResponse {
  items: AIModel[];
  total: number;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  model_id: string;
  created_at: string;
}

// Alias for backward compatibility
export type FavoriteModel = Favorite;

export interface FavoritesResponse {
  items: Favorite[];
  total: number;
}
