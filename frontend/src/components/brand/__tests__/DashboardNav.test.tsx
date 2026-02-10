// @TASK P4-S1-T1 - DashboardNav 컴포넌트 테스트
// @SPEC specs/screens/brand-dashboard.yaml

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardNav } from '../DashboardNav';

const mockPush = vi.fn();
let mockPathname = '/dashboard/brand';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

describe('DashboardNav', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockPathname = '/dashboard/brand';
  });

  it('renders all navigation items', () => {
    render(<DashboardNav />);

    expect(screen.getByText('주문 관리')).toBeInTheDocument();
    expect(screen.getByText('찜 목록')).toBeInTheDocument();
    expect(screen.getByText('프로필 설정')).toBeInTheDocument();
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('모델 탐색')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    mockPathname = '/dashboard/brand';
    render(<DashboardNav />);

    const ordersButton = screen.getByText('주문 관리').closest('button');
    expect(ordersButton?.className).toContain('bg-[#E882B2]');
  });

  it('navigates when item is clicked', () => {
    render(<DashboardNav />);

    fireEvent.click(screen.getByText('찜 목록'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/brand/favorites');
  });

  it('renders with sidebar layout', () => {
    const { container } = render(<DashboardNav />);

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<DashboardNav />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('highlights favorites when on favorites route', () => {
    mockPathname = '/dashboard/brand/favorites';
    render(<DashboardNav />);

    const favButton = screen.getByText('찜 목록').closest('button');
    expect(favButton?.className).toContain('bg-[#E882B2]');

    const ordersButton = screen.getByText('주문 관리').closest('button');
    expect(ordersButton?.className).not.toContain('bg-[#E882B2]');
  });
});
