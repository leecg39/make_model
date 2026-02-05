// @TASK P4-S1-T1, P4-S2-T1 - Order API services for Brand & Creator Dashboards

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

export const orderService = {
  /**
   * Get orders for creator
   */
  async getCreatorOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> {
    const response = await api.get<OrdersResponse>('/api/orders', {
      params: { ...params, role: 'creator' },
    });
    return response.data;
  },

  /**
   * Get brand orders
   */
  async getBrandOrders(page: number = 1, perPage: number = 20): Promise<BrandOrdersResponse> {
    const response = await api.get('/api/orders', {
      params: {
        role: 'brand',
        page,
        per_page: perPage,
      },
    });
    return response.data;
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
    const response = await api.get(`/api/delivery/${orderId}`);
    return response.data;
  },

  /**
   * Get settlements for creator
   */
  async getSettlements(params?: {
    page?: number;
    limit?: number;
  }): Promise<SettlementsResponse> {
    const response = await api.get<SettlementsResponse>('/api/settlements', {
      params,
    });
    return response.data;
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
    const response = await api.get('/api/favorites');
    return response.data;
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
