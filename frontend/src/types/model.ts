// @TASK P2-S3-T1 - AI Model type definitions
// @SPEC Phase 2 Model Profile Screen

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
  tags: string[] | null;
  images: ModelImage[];
  creator: ModelCreator;
  created_at: string;
  updated_at: string;
}

export interface FavoriteModel {
  id: string;
  user_id: string;
  model_id: string;
  created_at: string;
}
