// @TASK P4-S4-T1 - Order Chat Demo Page
// @SPEC specs/screens/order-chat.yaml

'use client';

import { useState } from 'react';
import { OrderSummary } from '@/components/OrderSummary';
import { MessageList } from '@/components/MessageList';
import { MessageInput } from '@/components/MessageInput';
import type { Order, ChatMessage, SendMessageRequest } from '@/types/chat';

type DemoState = 'empty' | 'loading' | 'conversation' | 'with-attachments';

const MOCK_ORDER: Order = {
  id: 'order-demo-1',
  order_number: 'ORD-2024-001',
  model: {
    id: 'model-1',
    name: 'AI Model Luna',
    profile_image: 'https://via.placeholder.com/150',
  },
  status: 'in_progress',
  package_type: 'Premium Package',
  created_at: '2024-02-01T10:00:00Z',
};

const MOCK_MESSAGES: Record<DemoState, ChatMessage[]> = {
  empty: [],
  loading: [],
  conversation: [
    {
      id: 'msg-1',
      order_id: 'order-demo-1',
      message: '안녕하세요! 주문하신 Premium Package에 대해 문의드립니다.',
      is_read: true,
      sender: { id: 'user-1', name: 'Brand User', role: 'brand' },
      created_at: '2024-02-01T10:00:00Z',
    },
    {
      id: 'msg-2',
      order_id: 'order-demo-1',
      message: '네, 무엇을 도와드릴까요?',
      is_read: true,
      sender: { id: 'user-2', name: 'Creator User', role: 'creator' },
      created_at: '2024-02-01T10:05:00Z',
    },
    {
      id: 'msg-3',
      order_id: 'order-demo-1',
      message: '촬영 컨셉 관련하여 추가 요청사항이 있습니다.\n배경은 화이트 톤으로 부탁드립니다.',
      is_read: true,
      sender: { id: 'user-1', name: 'Brand User', role: 'brand' },
      created_at: '2024-02-01T10:10:00Z',
    },
  ],
  'with-attachments': [
    {
      id: 'msg-1',
      order_id: 'order-demo-1',
      message: '레퍼런스 이미지 첨부드립니다.',
      attachment_url: 'https://via.placeholder.com/300',
      attachment_name: 'reference.jpg',
      attachment_size: 256000,
      is_read: true,
      sender: { id: 'user-1', name: 'Brand User', role: 'brand' },
      created_at: '2024-02-01T10:00:00Z',
    },
    {
      id: 'msg-2',
      order_id: 'order-demo-1',
      message: '확인했습니다. 초안 보내드릴게요.',
      attachment_url: 'https://via.placeholder.com/400',
      attachment_name: 'draft_v1.psd',
      attachment_size: 5242880,
      is_read: true,
      sender: { id: 'user-2', name: 'Creator User', role: 'creator' },
      created_at: '2024-02-01T10:30:00Z',
    },
  ],
};

export default function OrderChatDemoPage() {
  const [state, setState] = useState<DemoState>('conversation');
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES.conversation);

  const handleStateChange = (newState: DemoState) => {
    setState(newState);
    setMessages(MOCK_MESSAGES[newState]);
  };

  const handleSendMessage = (request: SendMessageRequest) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      order_id: 'order-demo-1',
      message: request.message,
      attachment_url: request.attachment ? URL.createObjectURL(request.attachment) : undefined,
      attachment_name: request.attachment?.name,
      attachment_size: request.attachment?.size,
      is_read: true,
      sender: { id: 'user-1', name: 'Brand User', role: 'brand' },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleAttachmentClick = (url: string, name: string) => {
    alert(`Opening attachment: ${name}\nURL: ${url}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Demo Controls */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            📱 Order Chat Demo (P4-S4-T1)
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {(['empty', 'loading', 'conversation', 'with-attachments'] as DemoState[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => handleStateChange(s)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    state === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {s}
                </button>
              )
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Current State</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify({ state, messageCount: messages.length }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Chat UI Preview */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">주문 채팅</h2>
          </div>

          {/* Content */}
          <div className="flex flex-col h-[600px]">
            {/* Order Summary */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <OrderSummary order={MOCK_ORDER} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden bg-white">
              {state === 'loading' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  currentUserId="user-1"
                  onAttachmentClick={handleAttachmentClick}
                />
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0">
              <MessageInput onSend={handleSendMessage} isLoading={state === 'loading'} />
            </div>
          </div>
        </div>
      </div>

      {/* Test Checklist */}
      <div className="max-w-5xl mx-auto mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">✅ Test Checklist</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ 주문 요약 카드 렌더링 (주문번호, 모델명, 상태, 패키지)</li>
          <li>✅ 메시지 목록 시간순 렌더링 (발신자/수신자 구분)</li>
          <li>✅ 텍스트 메시지 입력 및 전송</li>
          <li>✅ Enter 키로 전송, Shift+Enter로 줄바꿈</li>
          <li>✅ 파일 첨부 및 전송</li>
          <li>✅ 첨부 파일 클릭 시 다운로드/미리보기</li>
          <li>✅ 새 메시지 도착 시 자동 스크롤</li>
          <li>✅ Optimistic UI (전송 전 즉시 표시)</li>
          <li>✅ 빈 메시지 상태 렌더링</li>
          <li>✅ 로딩 상태 렌더링</li>
        </ul>
      </div>
    </div>
  );
}
