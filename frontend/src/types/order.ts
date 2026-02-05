// @TASK P4-S1-T1 - 브랜드 대시보드 주문 타입 정의
// @SPEC specs/screens/brand-dashboard.yaml

/**
 * Order status types
 */
export type OrderStatus =
  | 'pending'      // 결제 대기
  | 'paid'         // 결제 완료
  | 'in_progress'  // 작업 중
  | 'review'       // 검토 중
  | 'completed'    // 완료
  | 'cancelled';   // 취소

/**
 * Package type
 */
export type PackageType = 'basic' | 'standard' | 'premium';

/**
 * Order list item (for table)
 */
export interface OrderListItem {
  id: string;
  order_number: string;
  model_name: string;
  model_id: string;
  package_type: PackageType;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  has_chat: boolean;
}

/**
 * Order detail (for modal)
 */
export interface OrderDetail {
  id: string;
  order_number: string;
  model_name: string;
  model_id: string;
  package_type: PackageType;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at: string;
  brand_id: string;
  creator_id: string;
  description?: string;
  requirements?: string;
  delivery_date?: string;
  has_chat: boolean;
}

/**
 * Delivery file
 */
export interface DeliveryFile {
  id: string;
  order_id: string;
  file_url: string;
  file_name: string;
  file_size: number; // bytes
  uploaded_at: string;
}

/**
 * Favorite model
 */
export interface FavoriteModel {
  model_id: string;
  model_name: string;
  creator_name: string;
  thumbnail_url: string;
  created_at: string;
}

/**
 * API response types
 */
export interface OrdersResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  per_page: number;
}

export interface DeliveryFilesResponse {
  files: DeliveryFile[];
}

export interface FavoritesResponse {
  favorites: FavoriteModel[];
}
