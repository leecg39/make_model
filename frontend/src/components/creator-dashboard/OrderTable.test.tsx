// @TASK P4-S2-T1 - OrderTable component test
// @SPEC specs/screens/creator-dashboard.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderTable } from './OrderTable';
import type { Order } from '@/types/order';

const mockOrders: Order[] = [
  {
    id: '1',
    order_number: 'ORD-2024-001',
    brand_id: 'brand1',
    brand_name: 'Nike',
    creator_id: 'creator1',
    model_id: 'model1',
    model_name: 'AI Model 1',
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
    model_name: 'AI Model 2',
    package_type: 'premium',
    status: 'accepted',
    total_price: 1000000,
    created_at: '2024-02-02T10:00:00Z',
  },
];

describe('OrderTable', () => {
  const mockOnAccept = vi.fn();
  const mockOnReject = vi.fn();
  const mockOnComplete = vi.fn();
  const mockOnChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no orders', () => {
    render(
      <OrderTable
        orders={[]}
        isLoading={false}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onChat={mockOnChat}
      />
    );

    expect(screen.getByText('아직 받은 주문이 없습니다')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <OrderTable
        orders={[]}
        isLoading={true}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onChat={mockOnChat}
      />
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('renders order list with correct data', () => {
    render(
      <OrderTable
        orders={mockOrders}
        isLoading={false}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onChat={mockOnChat}
      />
    );

    expect(screen.getByText('ORD-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Nike')).toBeInTheDocument();
    expect(screen.getByText('AI Model 1')).toBeInTheDocument();
    expect(screen.getByText('500,000원')).toBeInTheDocument();
  });

  it('shows accept button for pending orders', () => {
    render(
      <OrderTable
        orders={mockOrders}
        isLoading={false}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onChat={mockOnChat}
      />
    );

    const acceptButtons = screen.getAllByText('수락');
    expect(acceptButtons.length).toBeGreaterThan(0);
  });

  it('calls onAccept when accept button clicked', async () => {
    const user = userEvent.setup();
    render(
      <OrderTable
        orders={mockOrders}
        isLoading={false}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onChat={mockOnChat}
      />
    );

    const acceptButtons = screen.getAllByText('수락');
    await user.click(acceptButtons[0]);

    expect(mockOnAccept).toHaveBeenCalledWith('1');
  });

  it('calls onReject when reject button clicked', async () => {
    const user = userEvent.setup();
    render(
      <OrderTable
        orders={mockOrders}
        isLoading={false}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onChat={mockOnChat}
      />
    );

    const rejectButtons = screen.getAllByText('거절');
    await user.click(rejectButtons[0]);

    expect(mockOnReject).toHaveBeenCalledWith('1');
  });

  it('calls onComplete when complete button clicked for accepted orders', async () => {
    const user = userEvent.setup();
    render(
      <OrderTable
        orders={mockOrders}
        isLoading={false}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onChat={mockOnChat}
      />
    );

    const completeButtons = screen.getAllByText('완료');
    await user.click(completeButtons[0]);

    expect(mockOnComplete).toHaveBeenCalledWith('2');
  });

  it('calls onChat when chat button clicked', async () => {
    const user = userEvent.setup();
    render(
      <OrderTable
        orders={mockOrders}
        isLoading={false}
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onChat={mockOnChat}
      />
    );

    const chatButtons = screen.getAllByText('채팅');
    await user.click(chatButtons[0]);

    expect(mockOnChat).toHaveBeenCalledWith('1');
  });
});
