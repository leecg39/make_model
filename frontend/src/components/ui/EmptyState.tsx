// @TASK P1-S0-T1 - Empty State component
// @SPEC Phase 1 Layout Components
'use client';

import { motion } from 'framer-motion';

export type EmptyStateVariant =
  | 'no_orders_brand'
  | 'no_orders_creator'
  | 'no_models'
  | 'no_search_results'
  | 'no_messages';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantConfig: Record<
  EmptyStateVariant,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
> = {
  no_orders_brand: {
    icon: (
      <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: '아직 주문이 없습니다',
    description: '크리에이터에게 첫 주문을 요청해보세요.',
  },
  no_orders_creator: {
    icon: (
      <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: '아직 받은 주문이 없습니다',
    description: '브랜드로부터 주문 요청을 기다리고 있습니다.',
  },
  no_models: {
    icon: (
      <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    title: '등록된 모델이 없습니다',
    description: '첫 번째 AI 모델을 등록해보세요.',
  },
  no_search_results: {
    icon: (
      <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    title: '검색 결과가 없습니다',
    description: '다른 검색어로 다시 시도해보세요.',
  },
  no_messages: {
    icon: (
      <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
    title: '메시지가 없습니다',
    description: '아직 주고받은 메시지가 없습니다.',
  },
};

export function EmptyState({ variant, action }: EmptyStateProps) {
  const config = variantConfig[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 bg-[#111] rounded-2xl border border-white/5"
    >
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        {config.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{config.title}</h3>
      <p className="text-white/50 text-center mb-6 max-w-sm">{config.description}</p>

      {action && (
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(232, 130, 178, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-6 py-2.5 bg-[#E882B2] text-black rounded-lg font-medium hover:bg-[#f598c4] transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
