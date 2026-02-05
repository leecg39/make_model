// @TASK P3-S1-T1 - Booking types
// @SPEC specs/screens/booking-wizard.yaml

export interface MatchingRecommendation {
  model: {
    id: string;
    creator_id: string;
    name: string;
    description?: string;
    style: string;
    gender: string;
    age_range: string;
    view_count: number;
    rating: number;
    status: string;
    thumbnail_url: string | null;
    tags: string[];
  };
  score: number;
}

export interface MatchingResponse {
  recommendations: MatchingRecommendation[];
}

export interface PackageOption {
  type: 'standard' | 'premium' | 'exclusive';
  name: string;
  imageCount: number;
  price: number;
  isExclusive: boolean;
  exclusiveMonths?: number;
  description: string;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  total_price: number;
  status: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  transaction_id: string;
}
