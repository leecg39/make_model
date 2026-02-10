// @TASK P4-S1-T1, P4-S2-T1 - Order API services for Brand & Creator Dashboards
// Falls back to empty mock data when backend is unavailable.

import api from './api';
import type {
  Order,
  OrdersResponse,
  OrderStatusUpdate,
  OrderDetail,
  Settlement,
  SettlementsResponse,
  DeliveryUpload,
  DeliveryFilesResponse,
  FavoritesResponse,
  BrandOrdersResponse,
} from '@/types/order';

function isNetworkError(err: unknown): boolean {
  return (err as any)?.code === 'ERR_NETWORK' || (err as any)?.message === 'Network Error';
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
    await api.post(`/api/delivery/${data.order_id}`, data);
  },

  /**
   * Get delivery files
   */
  async getDeliveryFiles(orderId: string): Promise<DeliveryFilesResponse> {
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
