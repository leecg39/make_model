// @TASK P4-S1-T1 - DashboardNav 컴포넌트 테스트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST TDD RED phase

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardNav } from '../DashboardNav';

describe('DashboardNav', () => {
  it('renders all navigation tabs', () => {
    render(<DashboardNav activeTab="orders" onTabChange={vi.fn()} />);

    expect(screen.getByText('주문 관리')).toBeInTheDocument();
    expect(screen.getByText('찜 목록')).toBeInTheDocument();
    expect(screen.getByText('프로필 설정')).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    render(<DashboardNav activeTab="orders" onTabChange={vi.fn()} />);

    const ordersTab = screen.getByText('주문 관리').closest('button');
    expect(ordersTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onTabChange when tab is clicked', () => {
    const mockOnTabChange = vi.fn();
    render(<DashboardNav activeTab="orders" onTabChange={mockOnTabChange} />);

    const favoritesTab = screen.getByText('찜 목록');
    fireEvent.click(favoritesTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('favorites');
  });

  it('renders with sidebar layout', () => {
    const { container } = render(
      <DashboardNav activeTab="orders" onTabChange={vi.fn()} />
    );

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const mockOnTabChange = vi.fn();
    render(<DashboardNav activeTab="orders" onTabChange={mockOnTabChange} />);

    const favoritesTab = screen.getByText('찜 목록');
    fireEvent.keyDown(favoritesTab, { key: 'Enter' });

    expect(mockOnTabChange).toHaveBeenCalledWith('favorites');
  });

  it('has proper ARIA attributes', () => {
    render(<DashboardNav activeTab="orders" onTabChange={vi.fn()} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    const ordersTab = screen.getByText('주문 관리').closest('button');
    expect(ordersTab).toHaveAttribute('role', 'tab');
  });
});
