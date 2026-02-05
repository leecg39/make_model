// @TASK P4-S4-T1 - Chat Types
// @SPEC specs/screens/order-chat.yaml

export interface Order {
  id: string;
  order_number: string;
  model: {
    id: string;
    name: string;
    profile_image?: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  package_type: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  order_id: string;
  message: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  is_read: boolean;
  sender: {
    id: string;
    name: string;
    role: 'brand' | 'creator';
  };
  created_at: string;
}

export interface DeliveryFile {
  id: string;
  order_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface SendMessageRequest {
  message: string;
  attachment?: File;
}

export interface ChatStats {
  unread_count: number;
}
