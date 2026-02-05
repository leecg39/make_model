// @TASK P4-S2-T1 - Creator Dashboard Demo Page
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { useState } from 'react';
import { DashboardNav } from '@/components/creator-dashboard/DashboardNav';
import { OrderTable } from '@/components/creator-dashboard/OrderTable';
import { MyModelsGrid } from '@/components/creator-dashboard/MyModelsGrid';
import { SettlementSummary } from '@/components/creator-dashboard/SettlementSummary';
import { RejectModal } from '@/components/creator-dashboard/RejectModal';
import { UploadModal } from '@/components/creator-dashboard/UploadModal';
import type { Order, Settlement } from '@/types/order';
import type { AIModel } from '@/types/model';

const DEMO_ORDERS: Order[] = [
  {
    id: '1',
    order_number: 'ORD-2024-001',
    brand_id: 'brand1',
    brand_name: 'Nike Korea',
    creator_id: 'creator1',
    model_id: 'model1',
    model_name: 'Fashion Model A',
    package_type: 'standard',
    status: 'pending',
    total_price: 500000,
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: '2',
    order_number: 'ORD-2024-002',
    brand_id: 'brand2',
    brand_name: 'Adidas',
    creator_id: 'creator1',
    model_id: 'model2',
    model_name: 'Fashion Model B',
    package_type: 'premium',
    status: 'accepted',
    total_price: 1000000,
    created_at: '2024-02-02T10:00:00Z',
  },
  {
    id: '3',
    order_number: 'ORD-2024-003',
    brand_id: 'brand3',
    brand_name: 'Puma',
    creator_id: 'creator1',
    model_id: 'model1',
    model_name: 'Fashion Model A',
    package_type: 'exclusive',
    status: 'completed',
    total_price: 2000000,
    created_at: '2024-01-25T10:00:00Z',
  },
];

const DEMO_MODELS: AIModel[] = [
  {
    id: '1',
    creator_id: 'creator1',
    name: 'Fashion Model A',
    description: 'Modern casual style',
    style: 'casual',
    gender: 'female',
    age_range: '20s',
    view_count: 1500,
    rating: 4.5,
    status: 'published',
    thumbnail_url: 'https://picsum.photos/seed/model1/400/600',
    tags: ['fashion', 'casual', 'modern'],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    creator_id: 'creator1',
    name: 'Fashion Model B',
    description: 'Elegant formal style',
    style: 'formal',
    gender: 'male',
    age_range: '30s',
    view_count: 800,
    rating: 4.2,
    status: 'active',
    thumbnail_url: 'https://picsum.photos/seed/model2/400/600',
    tags: ['fashion', 'formal', 'elegant'],
    created_at: '2024-01-15T00:00:00Z',
  },
];

const DEMO_SETTLEMENTS: Settlement[] = [
  {
    id: '1',
    order_id: 'order3',
    order_number: 'ORD-2024-003',
    total_amount: 2000000,
    platform_fee: 200000,
    settlement_amount: 1800000,
    status: 'completed',
    completed_date: '2024-02-15',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '2',
    order_id: 'order2',
    order_number: 'ORD-2024-002',
    total_amount: 1000000,
    platform_fee: 100000,
    settlement_amount: 900000,
    status: 'pending',
    scheduled_date: '2024-03-01',
    created_at: '2024-02-05T00:00:00Z',
  },
];

type DemoState = 'orders-normal' | 'orders-empty' | 'models-normal' | 'models-empty' | 'settlements-normal' | 'settlements-empty' | 'reject-modal' | 'upload-modal';

export default function CreatorDashboardDemoPage() {
  const [state, setState] = useState<DemoState>('orders-normal');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const renderContent = () => {
    switch (state) {
      case 'orders-normal':
        return (
          <OrderTable
            orders={DEMO_ORDERS}
            isLoading={false}
            onAccept={(id) => alert(`수락: ${id}`)}
            onReject={(id) => setRejectModalOpen(true)}
            onComplete={(id) => setUploadModalOpen(true)}
            onChat={(id) => alert(`채팅: ${id}`)}
          />
        );
      case 'orders-empty':
        return (
          <OrderTable
            orders={[]}
            isLoading={false}
            onAccept={() => {}}
            onReject={() => {}}
            onComplete={() => {}}
            onChat={() => {}}
          />
        );
      case 'models-normal':
        return <MyModelsGrid models={DEMO_MODELS} isLoading={false} />;
      case 'models-empty':
        return <MyModelsGrid models={[]} isLoading={false} />;
      case 'settlements-normal':
        return (
          <SettlementSummary
            settlements={DEMO_SETTLEMENTS}
            pendingAmount={900000}
            isLoading={false}
          />
        );
      case 'settlements-empty':
        return (
          <SettlementSummary
            settlements={[]}
            pendingAmount={0}
            isLoading={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* State Selector */}
      <div className="bg-bg-secondary border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-white font-semibold mb-3">데모 상태 선택</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'orders-normal', label: '주문 관리 - 일반' },
              { key: 'orders-empty', label: '주문 관리 - 빈 상태' },
              { key: 'models-normal', label: '내 모델 - 일반' },
              { key: 'models-empty', label: '내 모델 - 빈 상태' },
              { key: 'settlements-normal', label: '정산 - 일반' },
              { key: 'settlements-empty', label: '정산 - 빈 상태' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setState(item.key as DemoState)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    state === item.key
                      ? 'bg-accent-neon text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setRejectModalOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              거절 모달 열기
            </button>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            >
              업로드 모달 열기
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        <DashboardNav />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">
              {state.includes('orders') && '주문 관리'}
              {state.includes('models') && '내 모델'}
              {state.includes('settlements') && '정산'}
            </h1>

            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <RejectModal
        isOpen={rejectModalOpen}
        orderId="demo-order-1"
        onConfirm={(id, reason) => {
          alert(`거절: ${id}\n사유: ${reason}`);
          setRejectModalOpen(false);
        }}
        onCancel={() => setRejectModalOpen(false)}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        orderId="demo-order-2"
        onConfirm={async (id, files, notes) => {
          alert(`업로드: ${id}\n파일: ${files.length}개\n메모: ${notes}`);
          setUploadModalOpen(false);
        }}
        onCancel={() => setUploadModalOpen(false)}
      />

      {/* State Info */}
      <div className="fixed bottom-4 right-4 bg-bg-secondary border border-white/10 rounded-lg p-4 max-w-sm">
        <h3 className="text-white font-semibold mb-2">현재 상태</h3>
        <pre className="text-xs text-white/60 overflow-auto">
          {JSON.stringify({ state, rejectModalOpen, uploadModalOpen }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
