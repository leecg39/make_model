// @TASK P4-S4-T1 - OrderSummary Component
// @SPEC specs/screens/order-chat.yaml
// @TEST tests/components/OrderSummary.test.tsx

'use client';

import type { Order } from '@/types/chat';

interface OrderSummaryProps {
  order: Order;
}

export function OrderSummary({ order }: OrderSummaryProps) {
  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<Order['status'], string> = {
    pending: '대기중',
    in_progress: '진행중',
    completed: '완료',
    cancelled: '취소됨',
  };

  // Generate initials from model name (first letter of each word)
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Model Avatar */}
        <div className="flex-shrink-0">
          {order.model.profile_image ? (
            <img
              src={order.model.profile_image}
              alt={order.model.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
              {getInitials(order.model.name)}
            </div>
          )}
        </div>

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {order.model.name}
              </h2>
              <p className="text-sm text-gray-600">
                주문번호: {order.order_number}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                statusColors[order.status]
              }`}
            >
              {statusLabels[order.status]}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-medium">패키지:</span> {order.package_type}
            </p>
            <p>
              <span className="font-medium">주문일:</span>{' '}
              {new Date(order.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
