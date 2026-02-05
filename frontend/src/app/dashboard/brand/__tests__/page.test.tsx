// @TASK P4-S1-T1 - 브랜드 대시보드 페이지 테스트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST Integration test

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth';
import { orderService } from '@/services/order';
import BrandDashboardPage from '../page';

vi.mock('@/stores/auth');
vi.mock('@/services/order');

const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>;
const mockOrderService = orderService as {
  getBrandOrders: ReturnType<typeof vi.fn>;
  getOrderDetail: ReturnType<typeof vi.fn>;
  getDeliveryFiles: ReturnType<typeof vi.fn>;
};

const mockBrandUser = {
  id: 'b1',
  email: 'brand@example.com',
  name: 'Brand User',
  nickname: 'BrandCo',
  role: 'brand' as const,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
};

const mockOrders = [
  {
    id: '1',
    order_number: 'ORD-001',
    model_name: 'AI Model A',
    model_id: 'm1',
    package_type: 'premium' as const,
    status: 'completed' as const,
    total_price: 500000,
    created_at: '2026-02-01T10:00:00Z',
    has_chat: true,
  },
];

describe('BrandDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: authenticated brand user
    mockUseAuthStore.mockReturnValue({
      user: mockBrandUser,
      token: 'mock-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      clearError: vi.fn(),
      initialize: vi.fn(),
    });

    mockOrderService.getBrandOrders = vi.fn().mockResolvedValue({
      orders: mockOrders,
      total: 1,
      page: 1,
      per_page: 20,
    });

    mockOrderService.getOrderDetail = vi.fn().mockResolvedValue({
      ...mockOrders[0],
      updated_at: '2026-02-03T14:00:00Z',
      brand_id: 'b1',
      creator_id: 'c1',
      description: 'Test order',
      has_chat: true,
    });

    mockOrderService.getDeliveryFiles = vi.fn().mockResolvedValue({
      files: [],
    });
  });

  it('renders dashboard with navigation and orders', async () => {
    render(<BrandDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('브랜드 대시보드')).toBeInTheDocument();
    });

    // Check navigation tabs - "주문 관리" appears multiple times, use getAllByText
    const orderManagementTexts = screen.getAllByText('주문 관리');
    expect(orderManagementTexts.length).toBeGreaterThan(0);

    expect(screen.getByText('찜 목록')).toBeInTheDocument();
    expect(screen.getByText('프로필 설정')).toBeInTheDocument();
  });

  it('fetches orders on mount', async () => {
    render(<BrandDashboardPage />);

    await waitFor(() => {
      expect(mockOrderService.getBrandOrders).toHaveBeenCalled();
    });
  });

  it('displays orders in table', async () => {
    render(<BrandDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('AI Model A')).toBeInTheDocument();
    });
  });

  it('shows empty state when no orders', async () => {
    mockOrderService.getBrandOrders = vi.fn().mockResolvedValue({
      orders: [],
      total: 0,
      page: 1,
      per_page: 20,
    });

    render(<BrandDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('아직 주문 내역이 없습니다')).toBeInTheDocument();
    });
  });

  it('redirects to login if not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      clearError: vi.fn(),
      initialize: vi.fn(),
    });

    const { container } = render(<BrandDashboardPage />);

    // Should not render dashboard content
    expect(container.firstChild).toBeNull();
  });

  it('redirects to home if user is not brand', () => {
    mockUseAuthStore.mockReturnValue({
      user: { ...mockBrandUser, role: 'creator' },
      token: 'mock-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      clearError: vi.fn(),
      initialize: vi.fn(),
    });

    const { container } = render(<BrandDashboardPage />);

    // Should not render dashboard content
    expect(container.firstChild).toBeNull();
  });
});
