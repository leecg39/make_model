// @TASK P4-S2-T1 - Settlement Summary Component
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { motion } from 'framer-motion';
import type { Settlement } from '@/types/order';
import { EmptyState } from '@/components/ui/EmptyState';

interface SettlementSummaryProps {
  settlements: Settlement[];
  pendingAmount: number;
  isLoading: boolean;
}

export function SettlementSummary({
  settlements,
  pendingAmount,
  isLoading,
}: SettlementSummaryProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-white/60">
        로딩 중...
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <EmptyState variant="no_orders_creator" />
    );
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '대기',
      processing: '처리중',
      completed: '완료',
      failed: '실패',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Pending Amount Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-accent-neon/10 border border-accent-neon/30 rounded-2xl p-6"
      >
        <h3 className="text-sm text-white/60 mb-2">정산 대기 금액</h3>
        <p className="text-3xl font-bold text-accent-neon">{formatPrice(pendingAmount)}</p>
      </motion.div>

      {/* Settlement List */}
      <div className="bg-bg-secondary border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">정산 내역</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-6 text-sm font-semibold text-white/80">주문번호</th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-white/80">주문금액</th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-white/80">수수료</th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-white/80">정산금액</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-white/80">상태</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-white/80">날짜</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((settlement, index) => (
                <motion.tr
                  key={settlement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-4 px-6 text-white">
                    {settlement.order_number || settlement.order_id}
                  </td>
                  <td className="py-4 px-6 text-right text-white/70">
                    {formatPrice(settlement.total_amount)}
                  </td>
                  <td className="py-4 px-6 text-right text-red-400">
                    -{formatPrice(settlement.platform_fee)}
                  </td>
                  <td className="py-4 px-6 text-right text-white font-semibold">
                    {formatPrice(settlement.settlement_amount)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(settlement.status)}`}>
                      {getStatusLabel(settlement.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white/70 text-sm">
                    {settlement.status === 'pending' && settlement.scheduled_date && (
                      <span>예정일: {formatDate(settlement.scheduled_date)}</span>
                    )}
                    {settlement.status === 'completed' && settlement.completed_date && (
                      <span>{formatDate(settlement.completed_date)}</span>
                    )}
                    {settlement.status !== 'pending' && settlement.status !== 'completed' && (
                      <span>-</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
