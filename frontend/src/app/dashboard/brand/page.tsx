// @TASK P4-S1-T1 - 브랜드 대시보드 페이지 (주문 관리)
// @SPEC specs/screens/brand-dashboard.yaml

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNav } from '@/components/brand/DashboardNav';
import { OrderTable } from '@/components/brand/OrderTable';
import { OrderDetailModal } from '@/components/brand/OrderDetailModal';
import { EmptyState } from '@/components/brand/EmptyState';
import { orderService } from '@/services/order';
import { useAuthStore } from '@/stores/auth';
import type { OrderListItem, OrderDetail } from '@/types/order';

export default function BrandDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'brand') {
      router.push('/');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'brand') {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getBrandOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = async (order: OrderListItem) => {
    try {
      const detail = await orderService.getOrderDetail(order.id);
      setSelectedOrder(detail);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
    }
  };

  const handleChatClick = (orderId: string) => {
    router.push(`/orders/${orderId}/chat`);
  };

  const handleDownloadClick = async (orderId: string) => {
    try {
      const response = await orderService.getDeliveryFiles(orderId);
      if (response.files.length > 0) {
        window.open(response.files[0].file_url, '_blank');
      }
    } catch (error) {
      console.error('Failed to download files:', error);
    }
  };

  const handleExploreClick = () => {
    router.push('/explore');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (!user || user.role !== 'brand') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <DashboardNav />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              브랜드 <span className="text-[#E882B2]">대시보드</span>
            </h1>
            <p className="text-white/50">주문 내역을 관리하세요</p>
          </header>

          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">주문 관리</h2>
            {!isLoading && orders.length === 0 ? (
              <EmptyState onExploreClick={handleExploreClick} />
            ) : (
              <OrderTable
                orders={orders}
                onRowClick={handleRowClick}
                onChatClick={handleChatClick}
                onDownloadClick={handleDownloadClick}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </main>

      <OrderDetailModal
        isOpen={isModalOpen}
        order={selectedOrder}
        onClose={handleCloseModal}
      />
    </div>
  );
}
