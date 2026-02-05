// @TASK P3-S1-T1 - Booking service
// @SPEC specs/screens/booking-wizard.yaml

import api from './api';
import type { MatchingResponse, OrderResponse, PaymentResponse } from '@/types/booking';

export const bookingService = {
  /**
   * Get AI matching recommendations for concept
   */
  async getRecommendations(concept: string, images?: string[]): Promise<MatchingResponse> {
    const { data } = await api.post<MatchingResponse>('/api/matching/recommend', {
      concept_description: concept,
      reference_images: images || [],
    });
    return data;
  },

  /**
   * Create new order
   */
  async createOrder(params: {
    model_id: string;
    creator_id: string;
    concept_description: string;
    package_type: string;
    image_count: number;
    total_price: number;
    is_exclusive?: boolean;
    exclusive_months?: number;
  }): Promise<OrderResponse> {
    const { data } = await api.post<OrderResponse>('/api/orders', params);
    return data;
  },

  /**
   * Create payment for order
   */
  async createPayment(params: {
    order_id: string;
    payment_method: string;
    amount: number;
  }): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>('/api/payments', params);
    return data;
  },
};
