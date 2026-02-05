// @TASK P2-S2-T1 - 탐색 페이지 테스트
// @SPEC docs/planning/domain/resources.yaml - ai_models
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExplorePage from '@/app/explore/page';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import * as modelService from '@/services/model';
import * as favoriteService from '@/services/favorite';

// Mock services
vi.mock('@/services/model');
vi.mock('@/services/favorite');

describe('ExplorePage', () => {
  const mockModels = {
    items: [
      {
        id: 'model-1',
        creator_id: 'creator-1',
        name: 'Model 1',
        style: 'casual' as const,
        gender: 'female' as const,
        age_range: '20s' as const,
        view_count: 100,
        rating: 4.5,
        status: 'active' as const,
        thumbnail_url: 'https://example.com/1.jpg',
        tags: ['fashion'],
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'model-2',
        creator_id: 'creator-2',
        name: 'Model 2',
        style: 'formal' as const,
        gender: 'male' as const,
        age_range: '30s' as const,
        view_count: 200,
        rating: 4.8,
        status: 'active' as const,
        thumbnail_url: 'https://example.com/2.jpg',
        tags: ['business'],
        created_at: '2026-01-02T00:00:00Z',
      },
    ],
    total: 2,
    page: 1,
    limit: 12,
  };

  const mockFavorites = {
    items: [
      {
        id: 'fav-1',
        user_id: 'user-1',
        model_id: 'model-1',
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
    total: 1,
  };

  beforeEach(() => {
    // Reset stores
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
    useUIStore.setState({ toasts: [], isLoginModalOpen: false });

    // Mock API responses (default)
    vi.mocked(modelService.modelService.getModels).mockResolvedValue(mockModels);
    vi.mocked(favoriteService.favoriteService.getFavorites).mockResolvedValue(mockFavorites);
  });

  it('초기 로드 시 모델 카드 그리드를 표시한다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <ExplorePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Model 1')).toBeInTheDocument();
      expect(screen.getByText('Model 2')).toBeInTheDocument();
    });
  });

  it.skip('모델이 없을 때 EmptyState를 표시한다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    vi.mocked(modelService.modelService.getModels).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 12,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ExplorePage />
      </QueryClientProvider>
    );

    // 로딩 완료 대기 후 EmptyState 텍스트 확인
    await waitFor(
      () => {
        // EmptyState 컴포넌트의 텍스트 확인 (정확한 텍스트 또는 부분 매칭)
        const emptyText = screen.queryByText((content, element) => {
          return element?.textContent === '검색 결과가 없습니다' || content.includes('검색 결과가 없습니다');
        });
        expect(emptyText).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('필터 사이드바가 렌더링된다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <ExplorePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('스타일 필터')).toBeInTheDocument();
    });
  });

  it('검색바가 렌더링된다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <ExplorePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('모델 검색...')).toBeInTheDocument();
    });
  });

  it('정렬 드롭다운이 렌더링된다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <ExplorePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('정렬')).toBeInTheDocument();
    });
  });

  it('페이지네이션이 렌더링된다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <ExplorePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('페이지네이션')).toBeInTheDocument();
    });
  });
});
