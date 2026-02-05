// @TASK P4-S2-T1 - Order and Settlement API services
// @SPEC specs/screens/creator-dashboard.yaml

import api from './api';
import type {
  Order,
  OrdersResponse,
  OrderStatusUpdate,
  Settlement,
  SettlementsResponse,
  DeliveryUpload,
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
   * Update order status
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
};
