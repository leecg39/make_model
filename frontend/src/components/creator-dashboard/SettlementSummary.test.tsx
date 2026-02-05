// @TASK P4-S2-T1 - SettlementSummary component test
// @SPEC specs/screens/creator-dashboard.yaml

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettlementSummary } from './SettlementSummary';
import type { Settlement } from '@/types/order';

const mockSettlements: Settlement[] = [
  {
    id: '1',
    order_id: 'order1',
    order_number: 'ORD-2024-001',
    total_amount: 500000,
    platform_fee: 50000,
    settlement_amount: 450000,
    status: 'pending',
    scheduled_date: '2024-03-01',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '2',
    order_id: 'order2',
    order_number: 'ORD-2024-002',
    total_amount: 1000000,
    platform_fee: 100000,
    settlement_amount: 900000,
    status: 'completed',
    completed_date: '2024-02-15',
    created_at: '2024-01-20T00:00:00Z',
  },
];

describe('SettlementSummary', () => {
  it('renders empty state when no settlements', () => {
    render(
      <SettlementSummary
        settlements={[]}
        pendingAmount={0}
        isLoading={false}
      />
    );

    expect(screen.getByText('아직 받은 주문이 없습니다')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <SettlementSummary
        settlements={[]}
        pendingAmount={0}
        isLoading={true}
      />
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('displays pending amount', () => {
    render(
      <SettlementSummary
        settlements={mockSettlements}
        pendingAmount={450000}
        isLoading={false}
      />
    );

    expect(screen.getByText('정산 대기 금액')).toBeInTheDocument();
    const amounts = screen.getAllByText('450,000원');
    expect(amounts.length).toBeGreaterThan(0);
  });

  it('renders settlement list with correct data', () => {
    render(
      <SettlementSummary
        settlements={mockSettlements}
        pendingAmount={450000}
        isLoading={false}
      />
    );

    expect(screen.getByText('ORD-2024-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-2024-002')).toBeInTheDocument();
    expect(screen.getByText('대기')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('shows settlement amount after platform fee', () => {
    render(
      <SettlementSummary
        settlements={mockSettlements}
        pendingAmount={450000}
        isLoading={false}
      />
    );

    // Settlement amounts (after fee)
    const amounts = screen.getAllByText('450,000원');
    expect(amounts.length).toBeGreaterThan(0);
    expect(screen.getByText('900,000원')).toBeInTheDocument();
  });

  it('displays scheduled date for pending settlements', () => {
    render(
      <SettlementSummary
        settlements={mockSettlements}
        pendingAmount={450000}
        isLoading={false}
      />
    );

    expect(screen.getByText('예정일: 2024. 3. 1.')).toBeInTheDocument();
  });
});
