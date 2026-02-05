// @TASK P4-S1-T1 - OrderTable 컴포넌트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST src/components/brand/__tests__/OrderTable.test.tsx

'use client';

import type { OrderListItem, OrderStatus, PackageType } from '@/types/order';

interface OrderTableProps {
  orders: OrderListItem[];
  onRowClick: (order: OrderListItem) => void;
  onChatClick: (orderId: string) => void;
  onDownloadClick: (orderId: string) => void;
  isLoading: boolean;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  in_progress: '작업 중',
  review: '검토 중',
  completed: '완료',
  cancelled: '취소',
};

const PACKAGE_LABELS: Record<PackageType, string> = {
  basic: '베이직',
  standard: '스탠다드',
  premium: '프리미엄',
};

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

function formatDate(dateString: string): string {
  return dateString.split('T')[0];
}

export function OrderTable({
  orders,
  onRowClick,
  onChatClick,
  onDownloadClick,
  isLoading,
}: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/60">로딩 중...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/60">주문 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-sm font-semibold text-white/90">
              주문 번호
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white/90">
              모델명
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white/90">
              패키지
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white/90">
              상태
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white/90">
              금액
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white/90">
              주문일
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white/90">
              액션
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onRowClick(order)}
              className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-white/80">{order.order_number}</td>
              <td className="px-4 py-3 text-sm text-white">{order.model_name}</td>
              <td className="px-4 py-3 text-sm text-white/80">
                {PACKAGE_LABELS[order.package_type]}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    order.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : order.status === 'cancelled'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-white/80">
                {formatCurrency(order.total_price)}
              </td>
              <td className="px-4 py-3 text-sm text-white/60">
                {formatDate(order.created_at)}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {order.has_chat && (
                    <button
                      onClick={() => onChatClick(order.id)}
                      aria-label="채팅"
                      className="p-2 rounded hover:bg-white/10 transition-colors"
                      title="채팅"
                    >
                      <svg
                        className="w-4 h-4 text-white/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <button
                      onClick={() => onDownloadClick(order.id)}
                      aria-label="다운로드"
                      className="p-2 rounded hover:bg-white/10 transition-colors"
                      title="다운로드"
                    >
                      <svg
                        className="w-4 h-4 text-white/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
