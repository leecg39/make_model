// @TEST P2-S1-T1 - Home page integration tests
// @IMPL frontend/src/app/page.tsx
// @SPEC specs/screens/home.yaml

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { useRouter } from 'next/navigation';
import { modelService } from '@/services/model';
import { statsService } from '@/services/stats';
import type { AIModel } from '@/types/model';
import type { PlatformStats } from '@/types/stats';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/'),
}));

// Mock stores
const mockAuthStoreData = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
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
  toasts: [],
};

vi.mock('@/stores/ui', () => ({
  useUIStore: vi.fn((selector?: any) =>
    selector ? selector(mockUIStoreData) : mockUIStoreData
  ),
}));

// Mock services
vi.mock('@/services/model');
vi.mock('@/services/stats');

describe('HomePage', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };

  const mockPopularModels: AIModel[] = Array.from({ length: 8 }, (_, i) => ({
    id: `popular-${i + 1}`,
    creator_id: 'creator-1',
    name: `인기 모델 ${i + 1}`,
    description: `인기 모델 ${i + 1} 설명`,
    style: 'casual',
    gender: 'female' as const,
    age_range: '20-30',
    view_count: 1000 - i * 10,
    rating: 4.5,
    status: 'published' as const,
    thumbnail_url: `https://example.com/popular-${i + 1}.jpg`,
    tags: ['패션', '광고'],
    images: [],
    creator: {
      id: 'creator-1',
      nickname: 'creator1',
      email: 'creator1@example.com',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const mockRecentModels: AIModel[] = Array.from({ length: 8 }, (_, i) => ({
    id: `recent-${i + 1}`,
    creator_id: 'creator-2',
    name: `최신 모델 ${i + 1}`,
    description: `최신 모델 ${i + 1} 설명`,
    style: 'elegant',
    gender: 'male' as const,
    age_range: '30-40',
    view_count: 100 + i,
    rating: 4.0,
    status: 'published' as const,
    thumbnail_url: `https://example.com/recent-${i + 1}.jpg`,
    tags: ['비즈니스'],
    images: [],
    creator: {
      id: 'creator-2',
      nickname: 'creator2',
      email: 'creator2@example.com',
    },
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
  }));

  const mockStats: PlatformStats = {
    total_models: 1234,
    total_bookings: 567,
    total_brands: 89,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (useAuthStore as any).mockImplementation((selector?: any) =>
      selector ? selector(mockAuthStoreData) : mockAuthStoreData
    );
    (useUIStore as any).mockImplementation((selector?: any) =>
      selector ? selector(mockUIStoreData) : mockUIStoreData
    );

    // Mock service responses
    vi.mocked(modelService.getPopularModels).mockResolvedValue(mockPopularModels);
    vi.mocked(modelService.getRecentModels).mockResolvedValue(mockRecentModels);
    vi.mocked(statsService.getPlatformStats).mockResolvedValue(mockStats);
  });

  describe('초기 렌더링', () => {
    it('히어로 섹션을 표시해야 한다', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'AI 인플루언서 마켓플레이스' })).toBeInTheDocument();
      });

      // CTA 버튼 확인
      expect(screen.getByRole('button', { name: /탐색하기/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /모델 등록하기/i })).toBeInTheDocument();
    });

    it('인기 모델 8개를 표시해야 한다', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/인기 모델/i)).toBeInTheDocument();
      });

      // 8개의 인기 모델 확인
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(`인기 모델 ${i}`)).toBeInTheDocument();
      }
    });

    it('최신 모델 8개를 표시해야 한다', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/최신 등록 모델/i)).toBeInTheDocument();
      });

      // 8개의 최신 모델 확인
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(`최신 모델 ${i}`)).toBeInTheDocument();
      }
    });

    it('플랫폼 통계를 표시해야 한다', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('1,234')).toBeInTheDocument(); // total_models
      });

      expect(screen.getByText('567')).toBeInTheDocument(); // total_bookings
      expect(screen.getByText('89')).toBeInTheDocument(); // total_brands
    });
  });

  describe('모델 카드 클릭', () => {
    it('인기 모델 카드 클릭 시 상세 페이지로 이동해야 한다', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('인기 모델 1')).toBeInTheDocument();
      });

      const modelCard = screen.getByText('인기 모델 1').closest('a') || screen.getByText('인기 모델 1').closest('button');
      if (modelCard) {
        await user.click(modelCard);
        expect(mockRouter.push).toHaveBeenCalledWith('/models/popular-1');
      }
    });

    it('최신 모델 카드 클릭 시 상세 페이지로 이동해야 한다', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('최신 모델 1')).toBeInTheDocument();
      });

      const modelCard = screen.getByText('최신 모델 1').closest('a') || screen.getByText('최신 모델 1').closest('button');
      if (modelCard) {
        await user.click(modelCard);
        expect(mockRouter.push).toHaveBeenCalledWith('/models/recent-1');
      }
    });
  });

  describe('CTA 버튼 동작 (비로그인)', () => {
    it('탐색하기 버튼 클릭 시 /explore로 이동해야 한다', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /탐색하기/i })).toBeInTheDocument();
      });

      const exploreButton = screen.getByRole('button', { name: /탐색하기/i });
      await user.click(exploreButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/explore');
    });

    it('비로그인 시 모델 등록하기 버튼 클릭 시 로그인 모달을 열어야 한다', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /모델 등록하기/i })).toBeInTheDocument();
      });

      const registerButton = screen.getByRole('button', { name: /모델 등록하기/i });
      await user.click(registerButton);

      expect(mockUIStoreData.openLoginModal).toHaveBeenCalled();
    });
  });

  describe('CTA 버튼 동작 (크리에이터 로그인)', () => {
    beforeEach(() => {
      // Mock creator user
      mockAuthStoreData.user = {
        id: 'creator-1',
        email: 'creator@example.com',
        name: '크리에이터',
        nickname: 'creator1',
        role: 'creator',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      mockAuthStoreData.token = 'mock-token';

      (useAuthStore as any).mockImplementation((selector?: any) =>
        selector ? selector(mockAuthStoreData) : mockAuthStoreData
      );
    });

    it('크리에이터 로그인 시 모델 등록하기 버튼 클릭 시 /models/new로 이동해야 한다', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /모델 등록하기/i })).toBeInTheDocument();
      });

      const registerButton = screen.getByRole('button', { name: /모델 등록하기/i });
      await user.click(registerButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/models/new');
      expect(mockUIStoreData.openLoginModal).not.toHaveBeenCalled();
    });
  });

  describe('로딩 및 에러 상태', () => {
    it('로딩 중에 스켈레톤을 표시해야 한다', () => {
      // Mock pending promise
      vi.mocked(modelService.getPopularModels).mockReturnValue(new Promise(() => {}));
      vi.mocked(modelService.getRecentModels).mockReturnValue(new Promise(() => {}));
      vi.mocked(statsService.getPlatformStats).mockReturnValue(new Promise(() => {}));

      render(<HomePage />);

      // Loading indicators (can be skeleton or loading text)
      expect(screen.getByTestId('loading-popular-models') || screen.getByText(/로딩/i)).toBeInTheDocument();
    });

    it('API 에러 시 에러 메시지를 표시해야 한다', async () => {
      vi.mocked(modelService.getPopularModels).mockRejectedValue(new Error('API Error'));
      vi.mocked(modelService.getRecentModels).mockRejectedValue(new Error('API Error'));
      vi.mocked(statsService.getPlatformStats).mockRejectedValue(new Error('API Error'));

      render(<HomePage />);

      await waitFor(() => {
        // Check for any error message
        const errorMessages = screen.queryAllByText(/오류가 발생했습니다|API Error|불러올 수 없습니다/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('빈 상태', () => {
    it('모델이 없을 때 빈 상태 메시지를 표시해야 한다', async () => {
      vi.mocked(modelService.getPopularModels).mockResolvedValue([]);
      vi.mocked(modelService.getRecentModels).mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        const emptyMessages = screen.queryAllByText(/등록된 모델이 없습니다/i);
        expect(emptyMessages.length).toBeGreaterThan(0);
      });
    });
  });
});
