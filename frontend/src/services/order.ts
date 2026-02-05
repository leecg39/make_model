// @TASK P4-S1-T1 - 주문 API 서비스
// @SPEC specs/screens/brand-dashboard.yaml

import api from './api';
import type {
  OrdersResponse,
  OrderDetail,
  DeliveryFilesResponse,
  FavoritesResponse,
} from '@/types/order';

export const orderService = {
  /**
   * Get brand orders
   */
  async getBrandOrders(page: number = 1, perPage: number = 20): Promise<OrdersResponse> {
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
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<OrderDetail> {
    const response = await api.patch(`/api/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Get delivery files
   */
  async getDeliveryFiles(orderId: string): Promise<DeliveryFilesResponse> {
    const response = await api.get(`/api/delivery/${orderId}`);
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
