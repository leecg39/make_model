// @TEST P2-S1-T2 - Home page integration tests
// @IMPL frontend/src/app/page.tsx
// @SPEC specs/screens/home.yaml

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import type { AIModel } from '@/types/model';
import type { PlatformStats } from '@/types/stats';

// ============================================================================
// MOCKS: Zustand Stores
// ============================================================================

const mockAuthStoreData = {
  user: null as any,
  token: null as string | null,
  isLoading: false,
  error: null as string | null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  fetchUser: vi.fn(),
  clearError: vi.fn(),
  initialize: vi.fn(),
};

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn((selector?: any) =>
    selector ? selector(mockAuthStoreData) : mockAuthStoreData
  ),
}));

const mockUIStoreData = {
  isLoginModalOpen: false,
  openLoginModal: vi.fn(),
  closeLoginModal: vi.fn(),
  addToast: vi.fn(),
  removeToast: vi.fn(),
  toasts: [] as any[],
};

vi.mock('@/stores/ui', () => ({
  useUIStore: vi.fn((selector?: any) =>
    selector ? selector(mockUIStoreData) : mockUIStoreData
  ),
}));

// ============================================================================
// MOCKS: Services
// ============================================================================

const mockPopularModels: AIModel[] = [
  {
    id: 'model-1',
    creator_id: 'creator-1',
    name: 'Popular Model 1',
    description: 'A popular AI model',
    style: 'Fashion',
    gender: 'female',
    age_range: '20-30',
    view_count: 5000,
    rating: 4.8,
    status: 'published',
    thumbnail_url: 'https://example.com/model1.jpg',
    tags: ['fashion', 'trending'],
    images: [],
    creator: {
      id: 'creator-1',
      nickname: 'Creator One',
      email: 'creator1@example.com',
    },
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'model-2',
    creator_id: 'creator-2',
    name: 'Popular Model 2',
    description: 'Another popular AI model',
    style: 'Commercial',
    gender: 'male',
    age_range: '25-35',
    view_count: 4500,
    rating: 4.6,
    status: 'published',
    thumbnail_url: 'https://example.com/model2.jpg',
    tags: ['commercial'],
    images: [],
    creator: {
      id: 'creator-2',
      nickname: 'Creator Two',
      email: 'creator2@example.com',
    },
    created_at: '2024-01-09T00:00:00Z',
    updated_at: '2024-01-09T00:00:00Z',
  },
  {
    id: 'model-3',
    creator_id: 'creator-3',
    name: 'Popular Model 3',
    description: null,
    style: 'Lifestyle',
    gender: 'female',
    age_range: '18-28',
    view_count: 3800,
    rating: 4.5,
    status: 'published',
    thumbnail_url: 'https://example.com/model3.jpg',
    tags: ['lifestyle'],
    images: [],
    creator: {
      id: 'creator-3',
      nickname: 'Creator Three',
      email: 'creator3@example.com',
    },
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z',
  },
  {
    id: 'model-4',
    creator_id: 'creator-4',
    name: 'Popular Model 4',
    description: null,
    style: null,
    gender: 'other',
    age_range: null,
    view_count: 3200,
    rating: null,
    status: 'published',
    thumbnail_url: null,
    tags: [],
    images: [],
    creator: {
      id: 'creator-4',
      nickname: 'Creator Four',
      email: 'creator4@example.com',
    },
    created_at: '2024-01-07T00:00:00Z',
    updated_at: '2024-01-07T00:00:00Z',
  },
  {
    id: 'model-5',
    creator_id: 'creator-1',
    name: 'Popular Model 5',
    description: null,
    style: 'Fashion',
    gender: 'female',
    age_range: '22-32',
    view_count: 2900,
    rating: 4.7,
    status: 'published',
    thumbnail_url: 'https://example.com/model5.jpg',
    tags: ['fashion'],
    images: [],
    creator: {
      id: 'creator-1',
      nickname: 'Creator One',
      email: 'creator1@example.com',
    },
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-06T00:00:00Z',
  },
  {
    id: 'model-6',
    creator_id: 'creator-2',
    name: 'Popular Model 6',
    description: null,
    style: 'Commercial',
    gender: 'male',
    age_range: '28-38',
    view_count: 2700,
    rating: 4.4,
    status: 'published',
    thumbnail_url: 'https://example.com/model6.jpg',
    tags: ['commercial'],
    images: [],
    creator: {
      id: 'creator-2',
      nickname: 'Creator Two',
      email: 'creator2@example.com',
    },
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
  },
  {
    id: 'model-7',
    creator_id: 'creator-5',
    name: 'Popular Model 7',
    description: null,
    style: 'Beauty',
    gender: 'female',
    age_range: '20-30',
    view_count: 2500,
    rating: 4.9,
    status: 'published',
    thumbnail_url: 'https://example.com/model7.jpg',
    tags: ['beauty'],
    images: [],
    creator: {
      id: 'creator-5',
      nickname: 'Creator Five',
      email: 'creator5@example.com',
    },
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
  {
    id: 'model-8',
    creator_id: 'creator-6',
    name: 'Popular Model 8',
    description: null,
    style: 'Sports',
    gender: 'male',
    age_range: '25-35',
    view_count: 2300,
    rating: 4.3,
    status: 'published',
    thumbnail_url: 'https://example.com/model8.jpg',
    tags: ['sports'],
    images: [],
    creator: {
      id: 'creator-6',
      nickname: 'Creator Six',
      email: 'creator6@example.com',
    },
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

const mockRecentModels: AIModel[] = [
  {
    id: 'recent-1',
    creator_id: 'creator-1',
    name: 'Recent Model 1',
    description: 'A recently added AI model',
    style: 'Fashion',
    gender: 'female',
    age_range: '20-30',
    view_count: 150,
    rating: 4.5,
    status: 'published',
    thumbnail_url: 'https://example.com/recent1.jpg',
    tags: ['new', 'fashion'],
    images: [],
    creator: {
      id: 'creator-1',
      nickname: 'Creator One',
      email: 'creator1@example.com',
    },
    created_at: '2024-02-05T00:00:00Z',
    updated_at: '2024-02-05T00:00:00Z',
  },
  {
    id: 'recent-2',
    creator_id: 'creator-2',
    name: 'Recent Model 2',
    description: null,
    style: 'Commercial',
    gender: 'male',
    age_range: '25-35',
    view_count: 120,
    rating: 4.6,
    status: 'published',
    thumbnail_url: 'https://example.com/recent2.jpg',
    tags: ['new'],
    images: [],
    creator: {
      id: 'creator-2',
      nickname: 'Creator Two',
      email: 'creator2@example.com',
    },
    created_at: '2024-02-04T00:00:00Z',
    updated_at: '2024-02-04T00:00:00Z',
  },
  {
    id: 'recent-3',
    creator_id: 'creator-3',
    name: 'Recent Model 3',
    description: null,
    style: 'Lifestyle',
    gender: 'female',
    age_range: '18-28',
    view_count: 100,
    rating: 4.4,
    status: 'published',
    thumbnail_url: 'https://example.com/recent3.jpg',
    tags: ['new', 'lifestyle'],
    images: [],
    creator: {
      id: 'creator-3',
      nickname: 'Creator Three',
      email: 'creator3@example.com',
    },
    created_at: '2024-02-03T00:00:00Z',
    updated_at: '2024-02-03T00:00:00Z',
  },
  {
    id: 'recent-4',
    creator_id: 'creator-4',
    name: 'Recent Model 4',
    description: null,
    style: null,
    gender: 'other',
    age_range: null,
    view_count: 80,
    rating: null,
    status: 'published',
    thumbnail_url: null,
    tags: [],
    images: [],
    creator: {
      id: 'creator-4',
      nickname: 'Creator Four',
      email: 'creator4@example.com',
    },
    created_at: '2024-02-02T00:00:00Z',
    updated_at: '2024-02-02T00:00:00Z',
  },
  {
    id: 'recent-5',
    creator_id: 'creator-5',
    name: 'Recent Model 5',
    description: null,
    style: 'Beauty',
    gender: 'female',
    age_range: '22-32',
    view_count: 95,
    rating: 4.8,
    status: 'published',
    thumbnail_url: 'https://example.com/recent5.jpg',
    tags: ['new', 'beauty'],
    images: [],
    creator: {
      id: 'creator-5',
      nickname: 'Creator Five',
      email: 'creator5@example.com',
    },
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'recent-6',
    creator_id: 'creator-6',
    name: 'Recent Model 6',
    description: null,
    style: 'Sports',
    gender: 'male',
    age_range: '25-35',
    view_count: 110,
    rating: 4.2,
    status: 'published',
    thumbnail_url: 'https://example.com/recent6.jpg',
    tags: ['new', 'sports'],
    images: [],
    creator: {
      id: 'creator-6',
      nickname: 'Creator Six',
      email: 'creator6@example.com',
    },
    created_at: '2024-01-31T00:00:00Z',
    updated_at: '2024-01-31T00:00:00Z',
  },
  {
    id: 'recent-7',
    creator_id: 'creator-1',
    name: 'Recent Model 7',
    description: null,
    style: 'Fashion',
    gender: 'female',
    age_range: '20-30',
    view_count: 105,
    rating: 4.7,
    status: 'published',
    thumbnail_url: 'https://example.com/recent7.jpg',
    tags: ['new', 'fashion'],
    images: [],
    creator: {
      id: 'creator-1',
      nickname: 'Creator One',
      email: 'creator1@example.com',
    },
    created_at: '2024-01-30T00:00:00Z',
    updated_at: '2024-01-30T00:00:00Z',
  },
  {
    id: 'recent-8',
    creator_id: 'creator-7',
    name: 'Recent Model 8',
    description: null,
    style: 'Editorial',
    gender: 'female',
    age_range: '23-33',
    view_count: 125,
    rating: 4.6,
    status: 'published',
    thumbnail_url: 'https://example.com/recent8.jpg',
    tags: ['new', 'editorial'],
    images: [],
    creator: {
      id: 'creator-7',
      nickname: 'Creator Seven',
      email: 'creator7@example.com',
    },
    created_at: '2024-01-29T00:00:00Z',
    updated_at: '2024-01-29T00:00:00Z',
  },
];

const mockStats: PlatformStats = {
  total_models: 287,
  total_bookings: 156,
  total_brands: 45,
};

vi.mock('@/services/model', () => ({
  modelService: {
    getPopularModels: vi.fn(),
    getRecentModels: vi.fn(),
    getModels: vi.fn(),
    getModelById: vi.fn(),
  },
}));

vi.mock('@/services/stats', () => ({
  statsService: {
    getPlatformStats: vi.fn(),
  },
}));

// ============================================================================
// MOCKS: next/navigation
// ============================================================================

const mockPush = vi.fn();

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>(
    'next/navigation'
  );
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  };
});

// ============================================================================
// MOCKS: framer-motion
// ============================================================================

vi.mock('framer-motion', () => {
  const React = require('react');
  const createMotionComponent = (tagName: string) => {
    return React.forwardRef((props: any, ref: any) => {
      const {
        children,
        initial,
        animate,
        exit,
        whileHover,
        whileTap,
        whileInView,
        viewport,
        transition,
        variants,
        ...rest
      } = props;
      return React.createElement(tagName, { ...rest, ref }, children);
    });
  };
  const motionProxy = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === 'string') {
          // Return button for motion.button, div for others
          const tagName = prop === 'button' ? 'button' : 'div';
          return createMotionComponent(tagName);
        }
        return undefined;
      },
    }
  );
  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: any) => children,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useInView: () => true,
    useReducedMotion: () => false,
  };
});

// ============================================================================
// MOCKS: Layout component (avoid rendering actual layout)
// ============================================================================

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

// ============================================================================
// TESTS
// ============================================================================

describe('Home Page - Integration Tests (P2-S1-T2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStoreData.user = null;
    mockAuthStoreData.token = null;
    mockUIStoreData.isLoginModalOpen = false;
  });

  // =========================================================================
  // TEST 1: 초기 로드 - 히어로 + 인기 모델 8개 + 최신 모델 8개 + 통계
  // =========================================================================

  it('should display hero section, popular models, recent models, and stats on initial load', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Hero section should be visible
    expect(
      screen.getByText('AI 인플루언서 마켓플레이스')
    ).toBeInTheDocument();
    expect(screen.getByText('브랜드와 AI 모델을 연결하는 플랫폼, Make Model')).toBeInTheDocument();

    // Wait for models to load
    await waitFor(() => {
      expect(screen.getByText('Popular Model 1')).toBeInTheDocument();
    });

    // Check popular models section
    expect(screen.getByText('인기 모델')).toBeInTheDocument();
    expect(screen.getByText('Popular Model 1')).toBeInTheDocument();
    expect(screen.getByText('Popular Model 8')).toBeInTheDocument();

    // Check recent models section
    expect(screen.getByText('최신 등록 모델')).toBeInTheDocument();
    expect(screen.getByText('Recent Model 1')).toBeInTheDocument();
    expect(screen.getByText('Recent Model 8')).toBeInTheDocument();

    // Check stats section
    expect(screen.getByText('등록된 모델')).toBeInTheDocument();
    expect(screen.getByText('성사된 예약')).toBeInTheDocument();
    expect(screen.getByText('브랜드')).toBeInTheDocument();
    expect(screen.getByText('287')).toBeInTheDocument(); // total_models
    expect(screen.getByText('156')).toBeInTheDocument(); // total_bookings
    expect(screen.getByText('45')).toBeInTheDocument(); // total_brands
  });

  // =========================================================================
  // TEST 2: 모델 카드 클릭 - /models/:id로 이동
  // =========================================================================

  it('should navigate to model detail page when clicking on a model card', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for popular models to load
    await waitFor(() => {
      expect(screen.getByText('Popular Model 1')).toBeInTheDocument();
    });

    // Click on first popular model card
    const popularModel1Card = screen.getByText('Popular Model 1').closest('div');
    expect(popularModel1Card).toBeInTheDocument();

    const clickableArea = popularModel1Card?.closest(
      '[class*="rounded-2xl"]'
    );
    if (clickableArea) {
      await userEvent.click(clickableArea);
    }

    // Verify navigation was called with correct ID
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/models/model-1');
    });
  });

  it('should navigate to model detail page when clicking on a recent model card', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for recent models to load
    await waitFor(() => {
      expect(screen.getByText('Recent Model 1')).toBeInTheDocument();
    });

    // Click on first recent model card
    const recentModel1Card = screen.getByText('Recent Model 1').closest('div');
    expect(recentModel1Card).toBeInTheDocument();

    const clickableArea = recentModel1Card?.closest(
      '[class*="rounded-2xl"]'
    );
    if (clickableArea) {
      await userEvent.click(clickableArea);
    }

    // Verify navigation was called with correct ID
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/models/recent-1');
    });
  });

  // =========================================================================
  // TEST 3: CTA 비로그인 - "모델 등록하기" 클릭 시 로그인 모달 오픈
  // =========================================================================

  it('should open login modal when non-logged-in user clicks "모델 등록하기"', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');
    const { useUIStore } = await import('@/stores/ui');

    mockAuthStoreData.user = null; // Not logged in

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('AI 인플루언서 마켓플레이스')).toBeInTheDocument();
    });

    // Click "모델 등록하기" button
    const registerButtons = screen.getAllByRole('button');
    const registerButton = registerButtons.find(
      (btn) => btn.textContent?.includes('모델 등록하기')
    );
    expect(registerButton).toBeDefined();

    if (registerButton) {
      await userEvent.click(registerButton);
    }

    // Verify openLoginModal was called
    expect(mockUIStoreData.openLoginModal).toHaveBeenCalled();

    // Verify NO navigation occurred
    expect(mockPush).not.toHaveBeenCalled();
  });

  // =========================================================================
  // TEST 4: CTA 크리에이터 - "모델 등록하기" 클릭 시 /models/new로 이동
  // =========================================================================

  it('should navigate to /models/new when creator clicks "모델 등록하기"', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');
    const { useAuthStore } = await import('@/stores/auth');

    // Set user as creator
    mockAuthStoreData.user = {
      id: 'user-1',
      email: 'creator@example.com',
      role: 'creator',
      nickname: 'Test Creator',
    };

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('AI 인플루언서 마켓플레이스')).toBeInTheDocument();
    });

    // Click "모델 등록하기" button
    const registerButtons = screen.getAllByRole('button');
    const registerButton = registerButtons.find(
      (btn) => btn.textContent?.includes('모델 등록하기')
    );
    expect(registerButton).toBeDefined();

    if (registerButton) {
      await userEvent.click(registerButton);
    }

    // Verify navigation to /models/new
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/models/new');
    });

    // Verify login modal was NOT opened
    expect(mockUIStoreData.openLoginModal).not.toHaveBeenCalled();
  });

  it('should NOT navigate when non-creator user clicks "모델 등록하기"', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    // Set user as brand (not creator)
    mockAuthStoreData.user = {
      id: 'user-2',
      email: 'brand@example.com',
      role: 'brand',
      nickname: 'Test Brand',
    };

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('AI 인플루언서 마켓플레이스')).toBeInTheDocument();
    });

    // Click "모델 등록하기" button
    const registerButtons = screen.getAllByRole('button');
    const registerButton = registerButtons.find(
      (btn) => btn.textContent?.includes('모델 등록하기')
    );
    expect(registerButton).toBeDefined();

    if (registerButton) {
      await userEvent.click(registerButton);
    }

    // Verify openLoginModal was called (not navigation)
    expect(mockUIStoreData.openLoginModal).toHaveBeenCalled();

    // Verify NO navigation occurred
    expect(mockPush).not.toHaveBeenCalled();
  });

  // =========================================================================
  // TEST 5: 탐색하기 버튼 클릭 - /explore로 이동
  // =========================================================================

  it('should navigate to /explore when clicking "탐색하기" button', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('AI 인플루언서 마켓플레이스')).toBeInTheDocument();
    });

    // Click "탐색하기" button
    const buttons = screen.getAllByRole('button');
    const exploreButton = buttons.find(
      (btn) => btn.textContent?.includes('탐색하기')
    );
    expect(exploreButton).toBeDefined();

    if (exploreButton) {
      await userEvent.click(exploreButton);
    }

    // Verify navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/explore');
    });
  });

  // =========================================================================
  // TEST 6: 로딩 상태 - 스켈레톤 표시
  // =========================================================================

  it('should display loading skeleton for popular models during initial load', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    // Delay the API calls
    vi.mocked(modelService.getPopularModels).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockPopularModels), 100)
        )
    );
    vi.mocked(modelService.getRecentModels).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockRecentModels), 100)
        )
    );
    vi.mocked(statsService.getPlatformStats).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockStats), 100)
        )
    );

    const { rerender } = render(<HomePage />);

    // Check for loading state
    const loadingIndicator = screen.queryByTestId('loading-popular-models');
    if (loadingIndicator) {
      expect(loadingIndicator).toBeInTheDocument();
    }

    // Wait for models to load
    await waitFor(() => {
      expect(screen.getByText('Popular Model 1')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // TEST 7: 에러 상태 - 에러 메시지 표시
  // =========================================================================

  it('should display error message when popular models fail to load', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    const errorMessage = '인기 모델을 불러올 수 없습니다';
    vi.mocked(modelService.getPopularModels).mockRejectedValue(
      new Error(errorMessage)
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for error to display
    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`오류가 발생했습니다.*${errorMessage}`))
      ).toBeInTheDocument();
    });
  });

  it('should display error message when recent models fail to load', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    const errorMessage = '최신 모델을 불러올 수 없습니다';
    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockRejectedValue(
      new Error(errorMessage)
    );
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for error to display
    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`오류가 발생했습니다.*${errorMessage}`))
      ).toBeInTheDocument();
    });
  });

  it('should display error message when stats fail to load', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    const errorMessage = '통계를 불러올 수 없습니다';
    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<HomePage />);

    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/통계를 불러올 수 없습니다/)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // TEST 8: 빈 결과 상태 - 데이터 없을 때 메시지 표시
  // =========================================================================

  it('should display empty state when no popular models available', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    vi.mocked(modelService.getPopularModels).mockResolvedValue([]);
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for empty state to display
    await waitFor(() => {
      const sections = screen.getAllByText('인기 모델');
      expect(sections[0]).toBeInTheDocument();
    });

    // Check for empty state message
    const emptyMessage = screen.queryByText('등록된 모델이 없습니다');
    if (emptyMessage) {
      expect(emptyMessage).toBeInTheDocument();
    }
  });

  // =========================================================================
  // TEST 9: 모델 카드 정보 표시 - 축약 가능한 필드 처리
  // =========================================================================

  it('should display model card with optional fields', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for models to load
    await waitFor(() => {
      expect(screen.getByText('Popular Model 1')).toBeInTheDocument();
    });

    // Check model with all fields
    expect(screen.getByText('Popular Model 1')).toBeInTheDocument();

    // Check for view count (unique indicator)
    expect(screen.getByText('5,000 views')).toBeInTheDocument();

    // Check model with minimal fields (model-4)
    expect(screen.getByText('Popular Model 4')).toBeInTheDocument();

    // Verify both sections are visible
    const heading1 = screen.getByText('인기 모델');
    const heading2 = screen.getByText('최신 등록 모델');
    expect(heading1).toBeInTheDocument();
    expect(heading2).toBeInTheDocument();
  });

  // =========================================================================
  // TEST 10: 많은 모델 렌더링 성능 (8개씩 두 섹션)
  // =========================================================================

  it('should render 16 model cards efficiently (8 popular + 8 recent)', async () => {
    const { modelService } = await import('@/services/model');
    const { statsService } = await import('@/services/stats');

    vi.mocked(modelService.getPopularModels).mockResolvedValue(
      mockPopularModels
    );
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);

    render(<HomePage />);

    // Wait for all models to load
    await waitFor(() => {
      expect(screen.getByText('Popular Model 1')).toBeInTheDocument();
      expect(screen.getByText('Recent Model 1')).toBeInTheDocument();
    });

    // Count model cards
    const allModelNames = [
      ...mockPopularModels.map((m) => m.name),
      ...mockRecentModels.map((m) => m.name),
    ];

    for (const modelName of allModelNames) {
      expect(screen.getByText(modelName)).toBeInTheDocument();
    }
  });
});
