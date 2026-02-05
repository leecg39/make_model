// @TASK P4-S1-T1 - OrderTable 컴포넌트 테스트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST TDD RED phase

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderTable } from '../OrderTable';
import type { OrderListItem } from '@/types/order';

const mockOrders: OrderListItem[] = [
  {
    id: '1',
    order_number: 'ORD-001',
    model_name: 'AI Model A',
    model_id: 'm1',
    package_type: 'premium',
    status: 'completed',
    total_price: 500000,
    created_at: '2026-02-01T10:00:00Z',
    has_chat: true,
  },
  {
    id: '2',
    order_number: 'ORD-002',
    model_name: 'AI Model B',
    model_id: 'm2',
    package_type: 'standard',
    status: 'in_progress',
    total_price: 300000,
    created_at: '2026-02-05T15:30:00Z',
    has_chat: true,
  },
];

describe('OrderTable', () => {
  const mockOnRowClick = vi.fn();
  const mockOnChatClick = vi.fn();
  const mockOnDownloadClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers correctly', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    expect(screen.getByText('주문 번호')).toBeInTheDocument();
    expect(screen.getByText('모델명')).toBeInTheDocument();
    expect(screen.getByText('패키지')).toBeInTheDocument();
    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('금액')).toBeInTheDocument();
    expect(screen.getByText('주문일')).toBeInTheDocument();
    expect(screen.getByText('액션')).toBeInTheDocument();
  });

  it('renders order items correctly', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('AI Model A')).toBeInTheDocument();
    expect(screen.getByText('프리미엄')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('500,000원')).toBeInTheDocument();
  });

  it('calls onRowClick when row is clicked', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    const firstRow = screen.getByText('ORD-001').closest('tr');
    fireEvent.click(firstRow!);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockOrders[0]);
  });

  it('shows chat button for orders with chat', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    const chatButtons = screen.getAllByLabelText('채팅');
    expect(chatButtons).toHaveLength(2);
  });

  it('calls onChatClick when chat button is clicked', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    const chatButtons = screen.getAllByLabelText('채팅');
    fireEvent.click(chatButtons[0]);

    expect(mockOnChatClick).toHaveBeenCalledWith('1');
    expect(mockOnRowClick).not.toHaveBeenCalled(); // Event should not bubble
  });

  it('shows download button only for completed orders', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    const downloadButtons = screen.getAllByLabelText('다운로드');
    expect(downloadButtons).toHaveLength(1); // Only completed order
  });

  it('calls onDownloadClick when download button is clicked', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    const downloadButton = screen.getByLabelText('다운로드');
    fireEvent.click(downloadButton);

    expect(mockOnDownloadClick).toHaveBeenCalledWith('1');
    expect(mockOnRowClick).not.toHaveBeenCalled(); // Event should not bubble
  });

  it('shows loading state', () => {
    render(
      <OrderTable
        orders={[]}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={true}
      />
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('shows empty state when no orders', () => {
    render(
      <OrderTable
        orders={[]}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    expect(screen.getByText('주문 내역이 없습니다')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    expect(screen.getByText('500,000원')).toBeInTheDocument();
    expect(screen.getByText('300,000원')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(
      <OrderTable
        orders={mockOrders}
        onRowClick={mockOnRowClick}
        onChatClick={mockOnChatClick}
        onDownloadClick={mockOnDownloadClick}
        isLoading={false}
      />
    );

    expect(screen.getByText('2026-02-01')).toBeInTheDocument();
    expect(screen.getByText('2026-02-05')).toBeInTheDocument();
  });
});
