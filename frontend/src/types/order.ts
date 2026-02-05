// @TASK P4-S1-T1, P4-S2-T1 - Order types for Brand & Creator Dashboards

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'accepted'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type PackageType = 'basic' | 'standard' | 'premium' | 'exclusive';

// Creator Dashboard order type
export interface Order {
  id: string;
  order_number: string;
  brand_id: string;
  brand_name?: string;
  creator_id: string;
  model_id: string;
  model_name?: string;
  package_type: PackageType;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at?: string;
  rejection_reason?: string;
  has_chat?: boolean;
}

// Brand Dashboard order list item
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

// Brand Dashboard order detail
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

export interface OrdersResponse {
  items: Order[];
  total: number;
  page?: number;
  limit?: number;
}

export interface BrandOrdersResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  per_page: number;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  rejection_reason?: string;
}

// Settlement types
export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Settlement {
  id: string;
  order_id: string;
  order_number?: string;
  total_amount: number;
  platform_fee: number;
  settlement_amount: number;
  status: SettlementStatus;
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
}

export interface SettlementsResponse {
  items: Settlement[];
  total: number;
  pending_amount: number;
  completed_amount: number;
}

// Delivery types
export interface DeliveryUpload {
  order_id: string;
  file_urls: string[];
  notes?: string;
}

export interface DeliveryFile {
  id: string;
  order_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface DeliveryFilesResponse {
  files: DeliveryFile[];
}

// Favorites types
export interface FavoriteModel {
  model_id: string;
  model_name: string;
  creator_name: string;
  thumbnail_url: string;
  created_at: string;
}

export interface FavoritesResponse {
  favorites: FavoriteModel[];
}
