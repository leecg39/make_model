// @TASK P4-S1-T1 - 브랜드 대시보드 데모 페이지
// @SPEC specs/screens/brand-dashboard.yaml
// @DEMO All states: loading, empty, with-data, modal-open

'use client';

import { useState } from 'react';
import { OrderTable } from '@/components/brand/OrderTable';
import { OrderDetailModal } from '@/components/brand/OrderDetailModal';
import { EmptyState } from '@/components/brand/EmptyState';
import { DashboardNav, type DashboardTab } from '@/components/brand/DashboardNav';
import type { OrderListItem, OrderDetail } from '@/types/order';

const MOCK_ORDERS: OrderListItem[] = [
  {
    id: '1',
    order_number: 'ORD-2026-001',
    model_name: 'AI Fashion Model Luna',
    model_id: 'm1',
    package_type: 'premium',
    status: 'completed',
    total_price: 500000,
    created_at: '2026-02-01T10:00:00Z',
    has_chat: true,
  },
  {
    id: '2',
    order_number: 'ORD-2026-002',
    model_name: 'AI Idol Stella',
    model_id: 'm2',
    package_type: 'standard',
    status: 'in_progress',
    total_price: 300000,
    created_at: '2026-02-05T15:30:00Z',
    has_chat: true,
  },
  {
    id: '3',
    order_number: 'ORD-2026-003',
    model_name: 'AI Model Nova',
    model_id: 'm3',
    package_type: 'basic',
    status: 'paid',
    total_price: 150000,
    created_at: '2026-02-06T09:15:00Z',
    has_chat: false,
  },
];

const MOCK_ORDER_DETAIL: OrderDetail = {
  id: '1',
  order_number: 'ORD-2026-001',
  model_name: 'AI Fashion Model Luna',
  model_id: 'm1',
  package_type: 'premium',
  status: 'completed',
  total_price: 500000,
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-03T14:00:00Z',
  brand_id: 'b1',
  creator_id: 'c1',
  description: '제품 촬영용 AI 패션 모델',
  requirements: '깔끔한 배경, 자연스러운 포즈, 다양한 각도 10장',
  delivery_date: '2026-02-10',
  has_chat: true,
};

type DemoState = 'loading' | 'empty' | 'with-data' | 'modal-open';

const DEMO_STATES = {
  loading: { isLoading: true, orders: [] as OrderListItem[] },
  empty: { isLoading: false, orders: [] as OrderListItem[] },
  'with-data': { isLoading: false, orders: MOCK_ORDERS },
  'modal-open': { isLoading: false, orders: MOCK_ORDERS, modalOpen: true },
};

export default function BrandDashboardDemoPage() {
  const [state, setState] = useState<DemoState>('with-data');
  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentState = DEMO_STATES[state];

  const handleRowClick = (order: OrderListItem) => {
    setIsModalOpen(true);
  };

  const handleChatClick = (orderId: string) => {
    alert(`Navigate to /orders/${orderId}/chat`);
  };

  const handleDownloadClick = (orderId: string) => {
    alert(`Download files for order ${orderId}`);
  };

  const handleExploreClick = () => {
    alert('Navigate to /explore');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* State Selector */}
      <div className="bg-bg-secondary border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-white font-semibold mb-3">데모 상태 선택</h2>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setState(s);
                  if (s === 'modal-open') {
                    setIsModalOpen(true);
                  } else {
                    setIsModalOpen(false);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state === s
                    ? 'bg-accent-neon text-black'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex">
        {/* Sidebar */}
        <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                브랜드 대시보드 (데모)
              </h1>
              <p className="text-white/60">주문 내역과 찜한 모델을 관리하세요</p>
            </header>

            {/* Content based on active tab */}
            {activeTab === 'orders' && (
              <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">주문 관리</h2>
                {!currentState.isLoading && currentState.orders.length === 0 ? (
                  <EmptyState onExploreClick={handleExploreClick} />
                ) : (
                  <OrderTable
                    orders={currentState.orders}
                    onRowClick={handleRowClick}
                    onChatClick={handleChatClick}
                    onDownloadClick={handleDownloadClick}
                    isLoading={currentState.isLoading}
                  />
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">찜 목록</h2>
                <p className="text-white/60">찜 목록 기능 구현 예정</p>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">프로필 설정</h2>
                <p className="text-white/60">프로필 설정 기능 구현 예정</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isModalOpen || state === 'modal-open'}
        order={MOCK_ORDER_DETAIL}
        onClose={() => setIsModalOpen(false)}
      />

      {/* State Info */}
      <div className="fixed bottom-4 right-4 bg-bg-secondary border border-white/10 rounded-xl p-4 max-w-md">
        <h3 className="text-white font-semibold mb-2">현재 상태: {state}</h3>
        <pre className="text-xs text-white/60 overflow-auto max-h-48">
          {JSON.stringify(
            {
              state,
              activeTab,
              isLoading: currentState.isLoading,
              ordersCount: currentState.orders.length,
              modalOpen: isModalOpen || state === 'modal-open',
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
