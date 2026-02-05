// @TASK P4-S1-T1 - EmptyState 컴포넌트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST src/components/brand/__tests__/EmptyState.test.tsx

'use client';

interface EmptyStateProps {
  onExploreClick: () => void;
}

export function EmptyState({ onExploreClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <svg
        className="w-24 h-24 text-white/20 mb-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>

      {/* Message */}
      <h3 className="text-xl font-semibold text-white mb-2">
        아직 주문 내역이 없습니다
      </h3>
      <p className="text-white/60 text-center mb-6 max-w-md">
        AI 모델을 탐색하고 첫 주문을 시작해보세요
      </p>

      {/* CTA Button */}
      <button
        onClick={onExploreClick}
        className="px-6 py-3 bg-accent-neon text-black font-semibold rounded-full hover:bg-accent-neon/90 transition-all"
      >
        AI 모델 찾아보기
      </button>
    </div>
  );
}
