// @TASK P4-S1-T1 - OrderDetailModal 컴포넌트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST src/components/brand/__tests__/OrderDetailModal.test.tsx

'use client';

import { useEffect } from 'react';
import type { OrderDetail, OrderStatus, PackageType } from '@/types/order';

interface OrderDetailModalProps {
  isOpen: boolean;
  order: OrderDetail | null;
  onClose: () => void;
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

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderDetailModal({ isOpen, order, onClose }: OrderDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      data-testid="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        data-testid="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">주문 상세</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-6 h-6 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Order Info Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">주문 번호</p>
              <p className="text-white font-medium">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">상태</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm ${
                  order.status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : order.status === 'cancelled'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-white/60 mb-1">모델명</p>
            <p className="text-white font-medium">{order.model_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">패키지</p>
              <p className="text-white">{PACKAGE_LABELS[order.package_type]}</p>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">금액</p>
              <p className="text-white font-semibold">
                {formatCurrency(order.total_price)}
              </p>
            </div>
          </div>

          {order.description && (
            <div>
              <p className="text-sm text-white/60 mb-1">설명</p>
              <p className="text-white/80">{order.description}</p>
            </div>
          )}

          {order.requirements && (
            <div>
              <p className="text-sm text-white/60 mb-1">요구사항</p>
              <p className="text-white/80">{order.requirements}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">주문일</p>
              <p className="text-white/80">{formatDateTime(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">최종 수정</p>
              <p className="text-white/80">{formatDateTime(order.updated_at)}</p>
            </div>
          </div>

          {order.delivery_date && (
            <div>
              <p className="text-sm text-white/60 mb-1">납품 예정일</p>
              <p className="text-white/80">{order.delivery_date}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
