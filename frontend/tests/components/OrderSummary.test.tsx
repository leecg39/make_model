// @TASK P4-S4-T1 - OrderSummary Component Test
// @SPEC specs/screens/order-chat.yaml

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderSummary } from '@/components/OrderSummary';
import type { Order } from '@/types/chat';

describe('OrderSummary', () => {
  const mockOrder: Order = {
    id: 'order-1',
    order_number: 'ORD-2024-001',
    model: {
      id: 'model-1',
      name: 'AI Model Luna',
      profile_image: '/images/luna.jpg',
    },
    status: 'in_progress',
    package_type: 'Premium Package',
    created_at: '2024-02-01T10:00:00Z',
  };

  it('renders order number', () => {
    render(<OrderSummary order={mockOrder} />);
    expect(screen.getByText(/ORD-2024-001/i)).toBeInTheDocument();
  });

  it('renders model name', () => {
    render(<OrderSummary order={mockOrder} />);
    expect(screen.getByText(/AI Model Luna/i)).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<OrderSummary order={mockOrder} />);
    expect(screen.getByText(/진행중/i)).toBeInTheDocument();
  });

  it('renders package type', () => {
    render(<OrderSummary order={mockOrder} />);
    expect(screen.getByText(/Premium Package/i)).toBeInTheDocument();
  });

  it('renders profile image if provided', () => {
    render(<OrderSummary order={mockOrder} />);
    const img = screen.getByRole('img', { name: /AI Model Luna/i });
    expect(img).toHaveAttribute('src', '/images/luna.jpg');
  });

  it('handles missing profile image gracefully', () => {
    const orderWithoutImage = { ...mockOrder, model: { ...mockOrder.model, profile_image: undefined } };
    render(<OrderSummary order={orderWithoutImage} />);
    // Should render initials or placeholder (first letter of first two words: "AI Model")
    expect(screen.getByText(/AM/i)).toBeInTheDocument();
  });
});
