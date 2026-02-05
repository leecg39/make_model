// @TASK P1-S0-T1 - Status Badge component
// @SPEC Phase 1 Layout Components
'use client';

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    bgColor: string;
    textColor: string;
  }
> = {
  pending: {
    label: '접수',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  accepted: {
    label: '수락',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  in_progress: {
    label: '진행중',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
  },
  completed: {
    label: '완료',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  cancelled: {
    label: '취소',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.bgColor} ${config.textColor}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
