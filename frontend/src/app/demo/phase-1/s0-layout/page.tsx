// @TASK P1-S0-T1 - Layout Components Demo Page
// @SPEC Phase 1 Layout Components
'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ModelCard } from '@/components/cards/ModelCard';
import { StatusBadge, OrderStatus } from '@/components/ui/StatusBadge';
import { EmptyState, EmptyStateVariant } from '@/components/ui/EmptyState';
import { useUIStore } from '@/stores/ui';

const mockModels = [
  {
    id: '1',
    name: '지수',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    style: '세련된 도시 스타일',
    rating: 4.8,
  },
  {
    id: '2',
    name: '민지',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
    style: '우아한 클래식',
    rating: 4.9,
  },
  {
    id: '3',
    name: '서연',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
    style: '내추럴 캐주얼',
    rating: 4.7,
  },
  {
    id: '4',
    name: '하윤',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    style: '모던 시크',
    rating: 4.6,
  },
];

const orderStatuses: OrderStatus[] = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

const emptyStateVariants: EmptyStateVariant[] = [
  'no_orders_brand',
  'no_orders_creator',
  'no_models',
  'no_search_results',
  'no_messages',
];

export default function LayoutDemoPage() {
  const addToast = useUIStore((state) => state.addToast);
  const [selectedEmptyState, setSelectedEmptyState] = useState<EmptyStateVariant>('no_models');

  const handleToast = (variant: 'success' | 'error' | 'info') => {
    const messages = {
      success: '작업이 성공적으로 완료되었습니다!',
      error: '오류가 발생했습니다. 다시 시도해주세요.',
      info: '새로운 알림이 있습니다.',
    };

    addToast({
      variant,
      message: messages[variant],
    });
  };

  const handleToggleFavorite = (modelId: string) => {
    addToast({
      variant: 'success',
      message: '찜 목록에 추가되었습니다.',
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Phase 1 - Layout Components Demo</h1>
          <p className="text-gray-600">
            헤더, 푸터, 토스트, 모달 등 모든 레이아웃 컴포넌트를 확인할 수 있습니다.
          </p>
        </div>

        {/* Toast Demo */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Toast 알림</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-600 mb-4">다양한 Toast 알림을 테스트해보세요.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleToast('success')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Success Toast
              </button>
              <button
                onClick={() => handleToast('error')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Error Toast
              </button>
              <button
                onClick={() => handleToast('info')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Info Toast
              </button>
            </div>
          </div>
        </section>

        {/* Status Badges */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Status Badge</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-600 mb-4">주문 상태별 배지입니다.</p>
            <div className="flex flex-wrap gap-3">
              {orderStatuses.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
          </div>
        </section>

        {/* Model Cards */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Model Cards</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-600 mb-6">AI 모델 카드 그리드입니다. 하트 아이콘을 클릭하면 로그인 모달이 표시됩니다.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockModels.map((model) => (
                <ModelCard key={model.id} {...model} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          </div>
        </section>

        {/* Empty States */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Empty States</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-600 mb-4">다양한 빈 상태 화면입니다.</p>

            {/* Variant Selector */}
            <div className="mb-6 flex flex-wrap gap-2">
              {emptyStateVariants.map((variant) => (
                <button
                  key={variant}
                  onClick={() => setSelectedEmptyState(variant)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors text-sm
                    ${
                      selectedEmptyState === variant
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {variant}
                </button>
              ))}
            </div>

            {/* Empty State Display */}
            <div className="border border-gray-200 rounded-lg p-8">
              <EmptyState
                variant={selectedEmptyState}
                action={{
                  label: '새로 만들기',
                  onClick: () => handleToast('info'),
                }}
              />
            </div>
          </div>
        </section>

        {/* Header States Info */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Header States</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">비로그인 상태</p>
                <p className="text-sm text-gray-600">로그인, 회원가입 버튼이 표시됩니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">로그인 상태</p>
                <p className="text-sm text-gray-600">
                  프로필 드롭다운이 표시되며, 대시보드와 로그아웃 메뉴가 제공됩니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">모바일 반응형</p>
                <p className="text-sm text-gray-600">
                  768px 미만에서 햄버거 메뉴로 전환됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Footer</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-600">
              페이지 하단에 회사 정보, 이용약관, 개인정보처리방침, 고객센터 이메일이 표시됩니다.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
