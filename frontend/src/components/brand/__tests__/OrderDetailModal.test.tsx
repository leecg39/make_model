// @TASK P4-S1-T1 - OrderDetailModal 컴포넌트 테스트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST TDD RED phase

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderDetailModal } from '../OrderDetailModal';
import type { OrderDetail } from '@/types/order';

const mockOrder: OrderDetail = {
  id: '1',
  order_number: 'ORD-001',
  model_name: 'AI Model A',
  model_id: 'm1',
  package_type: 'premium',
  status: 'completed',
  total_price: 500000,
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-03T14:00:00Z',
  brand_id: 'b1',
  creator_id: 'c1',
  description: '제품 촬영용 AI 모델',
  requirements: '깔끔한 배경, 자연스러운 포즈',
  delivery_date: '2026-02-10',
  has_chat: true,
};

describe('OrderDetailModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<OrderDetailModal isOpen={true} order={mockOrder} onClose={mockOnClose} />);

    expect(screen.getByText('주문 상세')).toBeInTheDocument();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<OrderDetailModal isOpen={false} order={mockOrder} onClose={mockOnClose} />);

    expect(screen.queryByText('주문 상세')).not.toBeInTheDocument();
  });

  it('displays all order information', () => {
    render(<OrderDetailModal isOpen={true} order={mockOrder} onClose={mockOnClose} />);

    expect(screen.getByText('AI Model A')).toBeInTheDocument();
    expect(screen.getByText('프리미엄')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('500,000원')).toBeInTheDocument();
    expect(screen.getByText('제품 촬영용 AI 모델')).toBeInTheDocument();
    expect(screen.getByText('깔끔한 배경, 자연스러운 포즈')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<OrderDetailModal isOpen={true} order={mockOrder} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('닫기');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<OrderDetailModal isOpen={true} order={mockOrder} onClose={mockOnClose} />);

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close when modal content is clicked', () => {
    render(<OrderDetailModal isOpen={true} order={mockOrder} onClose={mockOnClose} />);

    const modalContent = screen.getByTestId('modal-content');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders without order (null state)', () => {
    render(<OrderDetailModal isOpen={true} order={null} onClose={mockOnClose} />);

    expect(screen.queryByText('주문 상세')).not.toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<OrderDetailModal isOpen={true} order={mockOrder} onClose={mockOnClose} />);

    // formatDateTime uses toLocaleString('ko-KR') which outputs "2026. 02. 01. 10:00" format
    expect(screen.getByText(/2026\.\s*02\.\s*01/)).toBeInTheDocument();
    expect(screen.getByText(/2026\.\s*02\.\s*03/)).toBeInTheDocument();
  });

  it('shows delivery date if available', () => {
    render(<OrderDetailModal isOpen={true} order={mockOrder} onClose={mockOnClose} />);

    expect(screen.getByText(/2026-02-10/)).toBeInTheDocument();
  });

  it('handles order without optional fields', () => {
    const minimalOrder: OrderDetail = {
      ...mockOrder,
      description: undefined,
      requirements: undefined,
      delivery_date: undefined,
    };

    render(<OrderDetailModal isOpen={true} order={minimalOrder} onClose={mockOnClose} />);

    expect(screen.getByText('주문 상세')).toBeInTheDocument();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });
});
