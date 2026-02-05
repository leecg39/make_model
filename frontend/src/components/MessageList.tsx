// @TASK P4-S4-T1 - MessageList Component
// @SPEC specs/screens/order-chat.yaml
// @TEST tests/components/MessageList.test.tsx

'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  onAttachmentClick?: (url: string, name: string) => void;
}

export function MessageList({ messages, currentUserId, onAttachmentClick }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>대화를 시작하세요</p>
      </div>
    );
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {messages.map((message) => {
        const isSent = message.sender.id === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                isSent
                  ? 'bg-blue-600 text-white sent'
                  : 'bg-gray-100 text-gray-900 received'
              }`}
            >
              {/* Sender Name (for received messages) */}
              {!isSent && (
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  {message.sender.name}
                </p>
              )}

              {/* Message Text */}
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.message}
              </p>

              {/* Attachment */}
              {message.attachment_url && (
                <button
                  onClick={() =>
                    onAttachmentClick?.(message.attachment_url!, message.attachment_name!)
                  }
                  className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isSent
                      ? 'bg-blue-700 hover:bg-blue-800'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs font-medium">{message.attachment_name}</p>
                    {message.attachment_size && (
                      <p className="text-xs opacity-70">
                        {formatFileSize(message.attachment_size)}
                      </p>
                    )}
                  </div>
                </button>
              )}

              {/* Timestamp */}
              <p
                className={`text-xs mt-1 ${
                  isSent ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
