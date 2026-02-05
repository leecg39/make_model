// @TASK P4-S4-T1 - Chat API Service
// @SPEC specs/screens/order-chat.yaml

import api from './api';
import type { Order, ChatMessage, DeliveryFile, SendMessageRequest, ChatStats } from '@/types/chat';

export const chatService = {
  /**
   * Fetch order details by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const { data } = await api.get<Order>(`/api/orders/${orderId}`);
    return data;
  },

  /**
   * Fetch chat messages for an order
   */
  async getMessages(orderId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/api/chat/${orderId}`);
    return data;
  },

  /**
   * Send a new message
   */
  async sendMessage(orderId: string, request: SendMessageRequest): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('message', request.message);
    if (request.attachment) {
      formData.append('attachment', request.attachment);
    }

    const { data } = await api.post<ChatMessage>(`/api/chat/${orderId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Mark messages as read
   */
  async markAsRead(orderId: string): Promise<void> {
    await api.post(`/api/chat/${orderId}/read`);
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(orderId: string): Promise<ChatStats> {
    const { data } = await api.get<ChatStats>(`/api/chat/${orderId}/unread`);
    return data;
  },

  /**
   * Fetch delivery files
   */
  async getDeliveryFiles(orderId: string): Promise<DeliveryFile[]> {
    const { data } = await api.get<DeliveryFile[]>(`/api/delivery/${orderId}`);
    return data;
  },
};
