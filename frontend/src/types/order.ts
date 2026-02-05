// @TASK P4-S2-T1 - Order and Settlement types for Creator Dashboard
// @SPEC specs/screens/creator-dashboard.yaml

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  brand_id: string;
  brand_name?: string;
  creator_id: string;
  model_id: string;
  model_name?: string;
  package_type: 'standard' | 'premium' | 'exclusive';
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at?: string;
  rejection_reason?: string;
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page?: number;
  limit?: number;
}

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

export interface OrderStatusUpdate {
  status: OrderStatus;
  rejection_reason?: string;
}

export interface DeliveryUpload {
  order_id: string;
  file_urls: string[];
  notes?: string;
}
