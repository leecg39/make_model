// @TASK P4-S2-T1 - Creator Dashboard Page
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/creator-dashboard/DashboardNav';
import { OrderTable } from '@/components/creator-dashboard/OrderTable';
import { RejectModal } from '@/components/creator-dashboard/RejectModal';
import { UploadModal } from '@/components/creator-dashboard/UploadModal';
import { orderService } from '@/services/order';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types/order';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalState, setRejectModalState] = useState<{
    isOpen: boolean;
    orderId: string;
  }>({ isOpen: false, orderId: '' });
  const [uploadModalState, setUploadModalState] = useState<{
    isOpen: boolean;
    orderId: string;
  }>({ isOpen: false, orderId: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getCreatorOrders();
      setOrders(response.items);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: 'accepted' });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  };

  const handleReject = (orderId: string) => {
    setRejectModalState({ isOpen: true, orderId });
  };

  const handleRejectConfirm = async (orderId: string, reason: string) => {
    try {
      await orderService.updateOrderStatus(orderId, {
        status: 'rejected',
        rejection_reason: reason,
      });
      setRejectModalState({ isOpen: false, orderId: '' });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to reject order:', error);
    }
  };

  const handleComplete = (orderId: string) => {
    setUploadModalState({ isOpen: true, orderId });
  };

  const handleUploadConfirm = async (
    orderId: string,
    files: File[],
    notes?: string
  ) => {
    try {
      // Upload files (실제 구현에서는 파일 업로드 후 URL을 받아야 함)
      const fileUrls = files.map((file) => URL.createObjectURL(file));
      await orderService.uploadDelivery({ order_id: orderId, file_urls: fileUrls, notes });
      await orderService.updateOrderStatus(orderId, { status: 'completed' });
      setUploadModalState({ isOpen: false, orderId: '' });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to upload delivery:', error);
    }
  };

  const handleChat = (orderId: string) => {
    router.push(`/orders/${orderId}/chat`);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <DashboardNav />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">주문 관리</h1>

          <OrderTable
            orders={orders}
            isLoading={isLoading}
            onAccept={handleAccept}
            onReject={handleReject}
            onComplete={handleComplete}
            onChat={handleChat}
          />
        </div>
      </main>

      <RejectModal
        isOpen={rejectModalState.isOpen}
        orderId={rejectModalState.orderId}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectModalState({ isOpen: false, orderId: '' })}
      />

      <UploadModal
        isOpen={uploadModalState.isOpen}
        orderId={uploadModalState.orderId}
        onConfirm={handleUploadConfirm}
        onCancel={() => setUploadModalState({ isOpen: false, orderId: '' })}
      />
    </div>
  );
}
