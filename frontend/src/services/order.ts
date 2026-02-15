// @TASK P4-S1-T1, P4-S2-T1 - Order API services for Brand & Creator Dashboards
// Falls back to empty mock data when backend is unavailable.

import api from './api';
import { isMockAuthMode } from '@/lib/auth-mode';
import type {
  Order,
  OrdersResponse,
  OrderStatusUpdate,
  OrderDetail,
  Settlement,
  SettlementsResponse,
  DeliveryUpload,
  DeliveryFile,
  DeliveryFilesResponse,
  FavoritesResponse,
  BrandOrdersResponse,
} from '@/types/order';

const MOCK_ORDERS_STORAGE_KEY = 'mock-orders-v1';
const MOCK_DELIVERY_STORAGE_KEY = 'mock-delivery-files-v1';

const DEFAULT_MOCK_ORDERS: Order[] = [
  {
    id: 'mock-order-1',
    order_number: 'ORD-2026-001',
    brand_id: 'brand-1',
    brand_name: 'Test Brand',
    creator_id: 'creator-1',
    model_id: 'm2f9a35e-6a4e-4f22-8ac7-e40f595b6d0f',
    model_name: 'Han Yuna',
    package_type: 'standard',
    status: 'pending',
    total_price: 320000,
    created_at: '2026-02-12T09:00:00Z',
    updated_at: '2026-02-12T09:00:00Z',
    has_chat: true,
  },
  {
    id: 'mock-order-2',
    order_number: 'ORD-2026-002',
    brand_id: 'brand-1',
    brand_name: 'Test Brand',
    creator_id: 'creator-1',
    model_id: 'm6a2be61-473a-426e-b233-432f83af3905',
    model_name: 'Min Seo',
    package_type: 'premium',
    status: 'accepted',
    total_price: 540000,
    created_at: '2026-02-10T14:00:00Z',
    updated_at: '2026-02-11T11:00:00Z',
    has_chat: true,
  },
  {
    id: 'mock-order-3',
    order_number: 'ORD-2026-003',
    brand_id: 'brand-2',
    brand_name: 'Pilot Apparel',
    creator_id: 'creator-1',
    model_id: 'm3c8f50b-d7dd-48b8-89d9-11cf0b68f6f3',
    model_name: 'Jiho',
    package_type: 'exclusive',
    status: 'completed',
    total_price: 890000,
    created_at: '2026-02-02T06:30:00Z',
    updated_at: '2026-02-08T18:10:00Z',
    has_chat: true,
  },
];

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) {
    return null;
  }

  try {
    const parsed = JSON.parse(authStorage);
    const userId = parsed?.state?.user?.id;
    return typeof userId === 'string' ? userId : null;
  } catch {
    return null;
  }
}

function readMockOrders(): Order[] {
  if (typeof window === 'undefined') {
    return DEFAULT_MOCK_ORDERS;
  }

  const raw = localStorage.getItem(MOCK_ORDERS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MOCK_ORDERS_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_ORDERS));
    return DEFAULT_MOCK_ORDERS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Order[];
    }
  } catch {
  }

  localStorage.setItem(MOCK_ORDERS_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_ORDERS));
  return DEFAULT_MOCK_ORDERS;
}

function writeMockOrders(orders: Order[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(MOCK_ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function readMockDeliveryFiles(): Record<string, DeliveryFile[]> {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = localStorage.getItem(MOCK_DELIVERY_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeMockDeliveryFiles(filesByOrder: Record<string, DeliveryFile[]>): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(MOCK_DELIVERY_STORAGE_KEY, JSON.stringify(filesByOrder));
}

function isNetworkError(err: unknown): boolean {
  const e = err as Error & { code?: string };
  return e?.code === 'ERR_NETWORK' || e?.message === 'Network Error';
}

export const orderService = {
  /**
   * Get orders for creator
   */
  async getCreatorOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> {
    if (isMockAuthMode()) {
      const userId = getCurrentUserId();
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      let items = readMockOrders();
      if (userId) {
        items = items.filter((order) => order.creator_id === userId);
      }

      if (params?.status) {
        items = items.filter((order) => order.status === params.status);
      }

      return {
        items: items.slice(offset, offset + limit),
        total: items.length,
        page,
        limit,
      };
    }

    try {
      const response = await api.get<OrdersResponse>('/api/orders', {
        params: { ...params, role: 'creator' },
      });
      return response.data;
    } catch (err) {
      if (isNetworkError(err)) {
        return { items: [], total: 0, page: params?.page || 1, limit: params?.limit || 20 };
      }
      throw err;
    }
  },

  /**
   * Get brand orders
   */
  async getBrandOrders(page: number = 1, perPage: number = 20): Promise<BrandOrdersResponse> {
    if (isMockAuthMode()) {
      const userId = getCurrentUserId();
      const offset = (page - 1) * perPage;

      let orders = readMockOrders();
      if (userId) {
        orders = orders.filter((order) => order.brand_id === userId);
      }

      const listItems = orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        model_name: order.model_name || 'Unknown Model',
        model_id: order.model_id,
        package_type: order.package_type,
        status: order.status,
        total_price: order.total_price,
        created_at: order.created_at,
        has_chat: order.has_chat ?? true,
      }));

      return {
        orders: listItems.slice(offset, offset + perPage),
        total: listItems.length,
        page,
        per_page: perPage,
      };
    }

    try {
      const response = await api.get('/api/orders', {
        params: { role: 'brand', page, per_page: perPage },
      });
      return response.data;
    } catch (err) {
      if (isNetworkError(err)) {
        return { orders: [], total: 0, page, per_page: perPage };
      }
      throw err;
    }
  },

  /**
   * Get order detail
   */
  async getOrderDetail(orderId: string): Promise<OrderDetail> {
    if (isMockAuthMode()) {
      const order = readMockOrders().find((item) => item.id === orderId);
      if (!order) {
        throw new Error('주문을 찾을 수 없습니다.');
      }

      return {
        id: order.id,
        order_number: order.order_number,
        model_name: order.model_name || 'Unknown Model',
        model_id: order.model_id,
        package_type: order.package_type,
        status: order.status,
        total_price: order.total_price,
        created_at: order.created_at,
        updated_at: order.updated_at || order.created_at,
        brand_id: order.brand_id,
        creator_id: order.creator_id,
        has_chat: order.has_chat ?? true,
      };
    }

    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order status (creator)
   */
  async updateOrderStatus(
    orderId: string,
    data: OrderStatusUpdate
  ): Promise<Order> {
    if (isMockAuthMode()) {
      const orders = readMockOrders();
      const index = orders.findIndex((order) => order.id === orderId);
      if (index < 0) {
        throw new Error('주문을 찾을 수 없습니다.');
      }

      const updatedOrder: Order = {
        ...orders[index],
        status: data.status,
        rejection_reason: data.rejection_reason,
        updated_at: new Date().toISOString(),
      };

      orders[index] = updatedOrder;
      writeMockOrders(orders);
      return updatedOrder;
    }

    const response = await api.patch<Order>(
      `/api/orders/${orderId}/status`,
      data
    );
    return response.data;
  },

  /**
   * Upload delivery files
   */
  async uploadDelivery(data: DeliveryUpload): Promise<void> {
    if (isMockAuthMode()) {
      const filesByOrder = readMockDeliveryFiles();
      const now = new Date().toISOString();
      const newFiles: DeliveryFile[] = data.file_urls.map((url, index) => ({
        id: `delivery-${Date.now()}-${index}`,
        order_id: data.order_id,
        file_url: url,
        file_name: `delivery-${index + 1}.jpg`,
        file_size: 0,
        uploaded_at: now,
      }));

      filesByOrder[data.order_id] = [...(filesByOrder[data.order_id] || []), ...newFiles];
      writeMockDeliveryFiles(filesByOrder);
      return;
    }

    await api.post(`/api/delivery/${data.order_id}`, data);
  },

  /**
   * Get delivery files
   */
  async getDeliveryFiles(orderId: string): Promise<DeliveryFilesResponse> {
    if (isMockAuthMode()) {
      const filesByOrder = readMockDeliveryFiles();
      return { files: filesByOrder[orderId] || [] };
    }

    try {
      const response = await api.get(`/api/delivery/${orderId}`);
      return response.data;
    } catch (err) {
      if (isNetworkError(err)) {
        return { files: [] };
      }
      throw err;
    }
  },

  /**
   * Get settlements for creator
   */
  async getSettlements(params?: {
    page?: number;
    limit?: number;
  }): Promise<SettlementsResponse> {
    if (isMockAuthMode()) {
      const userId = getCurrentUserId();
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      let orders = readMockOrders().filter((order) => order.status === 'completed');
      if (userId) {
        orders = orders.filter((order) => order.creator_id === userId);
      }

      const settlements: Settlement[] = orders.map((order) => {
        const platformFee = Math.round(order.total_price * 0.1);
        return {
          id: `settlement-${order.id}`,
          order_id: order.id,
          order_number: order.order_number,
          total_amount: order.total_price,
          platform_fee: platformFee,
          settlement_amount: order.total_price - platformFee,
          status: 'completed',
          completed_date: order.updated_at?.slice(0, 10) || order.created_at.slice(0, 10),
          created_at: order.created_at,
        };
      });

      const pageItems = settlements.slice(offset, offset + limit);
      const completedAmount = settlements.reduce((sum, item) => sum + item.settlement_amount, 0);

      return {
        items: pageItems,
        total: settlements.length,
        pending_amount: 0,
        completed_amount: completedAmount,
      };
    }

    try {
      const response = await api.get<SettlementsResponse>('/api/settlements', {
        params,
      });
      return response.data;
    } catch (err) {
      if (isNetworkError(err)) {
        return { items: [], total: 0, pending_amount: 0, completed_amount: 0 };
      }
      throw err;
    }
  },

  /**
   * Get settlement detail
   */
  async getSettlement(id: string): Promise<Settlement> {
    if (isMockAuthMode()) {
      const userId = getCurrentUserId();
      let orders = readMockOrders().filter((order) => order.status === 'completed');
      if (userId) {
        orders = orders.filter((order) => order.creator_id === userId);
      }

      const settlement = orders
        .map((order) => {
          const platformFee = Math.round(order.total_price * 0.1);
          return {
            id: `settlement-${order.id}`,
            order_id: order.id,
            order_number: order.order_number,
            total_amount: order.total_price,
            platform_fee: platformFee,
            settlement_amount: order.total_price - platformFee,
            status: 'completed' as const,
            completed_date: order.updated_at?.slice(0, 10) || order.created_at.slice(0, 10),
            created_at: order.created_at,
          };
        })
        .find((item) => item.id === id);

      if (!settlement) {
        throw new Error('정산 정보를 찾을 수 없습니다.');
      }
      return settlement;
    }

    const response = await api.get<Settlement>(`/api/settlements/${id}`);
    return response.data;
  },

  /**
   * Get favorites
   */
  async getFavorites(): Promise<FavoritesResponse> {
    try {
      const response = await api.get('/api/favorites');
      return response.data;
    } catch (err) {
      if (isNetworkError(err)) {
        return { favorites: [] };
      }
      throw err;
    }
  },

  /**
   * Add favorite
   */
  async addFavorite(modelId: string): Promise<void> {
    await api.post('/api/favorites', { model_id: modelId });
  },

  /**
   * Remove favorite
   */
  async removeFavorite(modelId: string): Promise<void> {
    await api.delete(`/api/favorites/${modelId}`);
  },
};
