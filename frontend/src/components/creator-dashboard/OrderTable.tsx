// @TASK P4-S2-T1 - Order Table Component
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { motion } from 'framer-motion';
import type { Order } from '@/types/order';
import { EmptyState } from '@/components/ui/EmptyState';

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onChat: (orderId: string) => void;
}

export function OrderTable({
  orders,
  isLoading,
  onAccept,
  onReject,
  onComplete,
  onChat,
}: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-white/60">
        로딩 중...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState variant="no_orders_creator" />
    );
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '대기',
      accepted: '수락',
      in_progress: '진행중',
      completed: '완료',
      rejected: '거절',
      cancelled: '취소',
    };
    return labels[status] || status;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-4 px-4 text-sm font-semibold text-white/80">주문번호</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-white/80">브랜드</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-white/80">모델</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-white/80">패키지</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-white/80">상태</th>
            <th className="text-right py-4 px-4 text-sm font-semibold text-white/80">금액</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-white/80">주문일</th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-white/80">액션</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <motion.tr
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-white/5 hover:bg-white/5"
            >
              <td className="py-4 px-4 text-white">{order.order_number}</td>
              <td className="py-4 px-4 text-white">{order.brand_name || '-'}</td>
              <td className="py-4 px-4 text-white">{order.model_name || '-'}</td>
              <td className="py-4 px-4 text-white/70">{order.package_type}</td>
              <td className="py-4 px-4">
                <span
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${order.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                    ${order.status === 'rejected' ? 'bg-red-500/20 text-red-400' : ''}
                  `}
                >
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td className="py-4 px-4 text-right text-white font-semibold">
                {formatPrice(order.total_price)}
              </td>
              <td className="py-4 px-4 text-white/70 text-sm">
                {formatDate(order.created_at)}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAccept(order.id)}
                        className="px-3 py-1 bg-accent-neon text-black text-sm rounded-lg font-medium"
                      >
                        수락
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onReject(order.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg"
                      >
                        거절
                      </motion.button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onComplete(order.id)}
                      className="px-3 py-1 bg-accent-neon text-black text-sm rounded-lg font-medium"
                    >
                      완료
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onChat(order.id)}
                    className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg"
                  >
                    채팅
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
