// @TASK P4-S4-T1 - Order Chat Page
// @SPEC specs/screens/order-chat.yaml

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderSummary } from '@/components/OrderSummary';
import { MessageList } from '@/components/MessageList';
import { MessageInput } from '@/components/MessageInput';
import { chatService } from '@/services/chat';
import { useAuthStore } from '@/stores/auth';
import type { Order, ChatMessage, SendMessageRequest } from '@/types/chat';

export default function OrderChatPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const user = useAuthStore((state) => state.user);

  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoadingOrder(true);
        const orderData = await chatService.getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        setError((err as Error).message || '주문 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoadingOrder(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const messagesData = await chatService.getMessages(orderId);
        setMessages(messagesData);

        // Mark messages as read
        await chatService.markAsRead(orderId);
      } catch (err) {
        setError((err as Error).message || '메시지를 불러올 수 없습니다.');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Poll for new messages every 5 seconds (WebSocket simulation)
    const intervalId = setInterval(fetchMessages, 5000);

    return () => clearInterval(intervalId);
  }, [orderId]);

  // Send message handler
  const handleSendMessage = async (request: SendMessageRequest) => {
    if (!user) return;

    // Optimistic UI update
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      order_id: orderId,
      message: request.message,
      attachment_url: request.attachment ? URL.createObjectURL(request.attachment) : undefined,
      attachment_name: request.attachment?.name,
      attachment_size: request.attachment?.size,
      is_read: true,
      sender: {
        id: user.id,
        name: user.name || user.email,
        role: user.role as 'brand' | 'creator',
      },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setIsSending(true);

    try {
      const sentMessage = await chatService.sendMessage(orderId, request);

      // Replace optimistic message with real message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === optimisticMessage.id ? sentMessage : msg))
      );
    } catch (err) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      alert('메시지 전송에 실패했습니다: ' + (err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  // Attachment click handler
  const handleAttachmentClick = (url: string) => {
    // Open in new tab or download
    window.open(url, '_blank');
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (isLoadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600">{error || '주문을 찾을 수 없습니다.'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로 가기"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">주문 채팅</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Order Summary */}
        <div className="flex-shrink-0 p-4">
          <OrderSummary order={order} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden bg-white border-t border-gray-200">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <MessageList
              messages={messages}
              currentUserId={user.id}
              onAttachmentClick={handleAttachmentClick}
            />
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <MessageInput onSend={handleSendMessage} isLoading={isSending} />
        </div>
      </div>
    </div>
  );
}
