// @TASK P4-S2-T1 - Creator Settlements Page
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/creator-dashboard/DashboardNav';
import { SettlementSummary } from '@/components/creator-dashboard/SettlementSummary';
import { orderService } from '@/services/order';
import type { Settlement } from '@/types/order';

export default function CreatorSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getSettlements();
      setSettlements(response.items);
      setPendingAmount(response.pending_amount || 0);
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <DashboardNav />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">정산</h1>

          <SettlementSummary
            settlements={settlements}
            pendingAmount={pendingAmount}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
