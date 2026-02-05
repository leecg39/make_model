// @TASK P4-S2-T1 - DashboardNav component test
// @SPEC specs/screens/creator-dashboard.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardNav } from './DashboardNav';

const mockPush = vi.fn();
const mockUseRouter = vi.fn();
const mockUsePathname = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
}));

describe('DashboardNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUsePathname.mockReturnValue('/dashboard/creator');
  });

  it('renders all navigation tabs', () => {
    render(<DashboardNav />);

    expect(screen.getByText('주문 관리')).toBeInTheDocument();
    expect(screen.getByText('내 모델')).toBeInTheDocument();
    expect(screen.getByText('정산')).toBeInTheDocument();
    expect(screen.getByText('프로필 설정')).toBeInTheDocument();
  });

  it('highlights active tab based on current route', () => {
    mockUsePathname.mockReturnValue('/dashboard/creator/models');

    render(<DashboardNav />);

    const modelsTab = screen.getByText('내 모델').closest('button');
    expect(modelsTab).toHaveClass('bg-accent-neon');
  });

  it('navigates to correct route on tab click', async () => {
    const user = userEvent.setup();
    render(<DashboardNav />);

    await user.click(screen.getByText('정산'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/creator/settlements');
  });
});
