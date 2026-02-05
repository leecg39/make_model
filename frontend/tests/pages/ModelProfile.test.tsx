// @TEST P2-S3-T1 - Model profile page integration tests
// @IMPL frontend/src/app/models/[id]/page.tsx
// @SPEC Phase 2 Model Profile Screen

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModelProfilePage from '@/app/models/[id]/page';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { modelService } from '@/services/model';
import { favoriteService } from '@/services/favorite';

// Mock services
vi.mock('@/services/model', () => ({
  modelService: {
    getModelById: vi.fn(),
    incrementViewCount: vi.fn(),
  },
}));

vi.mock('@/services/favorite', () => ({
  favoriteService: {
    getFavorites: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    isFavorited: vi.fn(),
  },
}));

// Mock stores with selector support
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

// Mock useParams to return test model ID
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: 'test-model-id' })),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })),
    usePathname: vi.fn(() => '/models/test-model-id'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  };
});

describe('ModelProfilePage', () => {
  const mockModel = {
    id: 'test-model-id',
    creator_id: 'creator-1',
    name: '테스트 모델',
    description: '테스트 모델 설명입니다.',
    style: '패션',
    gender: 'female' as const,
    age_range: '20대',
    view_count: 1234,
    rating: 4.5,
    status: 'published' as const,
    thumbnail_url: 'https://example.com/thumb.jpg',
    tags: ['패션', '뷰티'],
    images: [
      {
        id: 'img-1',
        model_id: 'test-model-id',
        image_url: 'https://example.com/img1.jpg',
        display_order: 1,
        is_thumbnail: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'img-2',
        model_id: 'test-model-id',
        image_url: 'https://example.com/img2.jpg',
        display_order: 2,
        is_thumbnail: false,
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'img-3',
        model_id: 'test-model-id',
        image_url: 'https://example.com/img3.jpg',
        display_order: 3,
        is_thumbnail: false,
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    creator: {
      id: 'creator-1',
      email: 'creator@example.com',
      nickname: '크리에이터',
      profile_image: 'https://example.com/profile.jpg',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(modelService.getModelById).mockResolvedValue(mockModel);
    vi.mocked(modelService.incrementViewCount).mockResolvedValue(undefined);
    vi.mocked(favoriteService.isFavorited).mockResolvedValue(false);
  });

  describe('T1.1 - Initial load', () => {
    // @TEST T1.1.1 - Display model basic info
    it('should display model name, style, gender, age range, view count, rating', async () => {
      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      expect(screen.getByText('패션')).toBeInTheDocument();
      expect(screen.getByText('여성')).toBeInTheDocument();
      expect(screen.getByText('20대')).toBeInTheDocument();
      expect(screen.getByText(/1,234/)).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    // @TEST T1.1.2 - Display three CTA buttons
    it('should display three CTA buttons: 섭외 요청하기, 찜하기, 문의하기', async () => {
      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /섭외 요청하기/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /찜하기/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /문의하기/i })).toBeInTheDocument();
    });

    // @TEST T1.1.3 - Display portfolio gallery
    it('should display portfolio images in gallery', async () => {
      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      const images = screen.getAllByRole('img', { name: /포트폴리오/i });
      expect(images.length).toBe(3);
    });

    // @TEST T1.1.4 - Display creator info
    it('should display creator info card', async () => {
      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      expect(screen.getByText('크리에이터')).toBeInTheDocument();
    });
  });

  describe('T1.2 - 섭외 요청 (non-authenticated)', () => {
    // @TEST T1.2.1 - Open login modal when not logged in
    it('should open login modal when 섭외 요청하기 clicked without login', async () => {
      const user = userEvent.setup();
      const mockOpenLoginModal = vi.fn();

      vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
        const data = {
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
        return selector ? selector(data) : data;
      });

      vi.mocked(useUIStore).mockImplementation((selector?: any) => {
        const data = {
          isLoginModalOpen: false,
          openLoginModal: mockOpenLoginModal,
          closeLoginModal: vi.fn(),
          addToast: vi.fn(),
          removeToast: vi.fn(),
          toasts: [],
        };
        return selector ? selector(data) : data;
      });

      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      const bookingButton = screen.getByRole('button', { name: /섭외 요청하기/i });
      await user.click(bookingButton);

      expect(mockOpenLoginModal).toHaveBeenCalled();
    });
  });

  describe('T1.3 - Image lightbox', () => {
    // @TEST T1.3.1 - Open lightbox on image click
    it('should open lightbox when portfolio image is clicked', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      const images = screen.getAllByRole('img', { name: /포트폴리오/i });
      await user.click(images[0]);

      // Lightbox should be visible
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /이미지 확대/i })).toBeInTheDocument();
      });
    });

    // @TEST T1.3.2 - Close lightbox with ESC key
    it('should close lightbox when ESC key is pressed', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      const images = screen.getAllByRole('img', { name: /포트폴리오/i });
      await user.click(images[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /이미지 확대/i })).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /이미지 확대/i })).not.toBeInTheDocument();
      });
    });

    // @TEST T1.3.3 - Navigate to next image
    it('should navigate to next image in lightbox', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      const images = screen.getAllByRole('img', { name: /포트폴리오/i });
      await user.click(images[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /이미지 확대/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /다음 이미지/i });
      await user.click(nextButton);

      // Should show second image
      const lightboxImage = screen.getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img2.jpg');
    });
  });

  describe('T1.4 - Favorite toggle (authenticated)', () => {
    // @TEST T1.4.1 - Toggle favorite on click
    it('should toggle favorite when 찜하기 button clicked (logged in)', async () => {
      const user = userEvent.setup();
      const mockAddFavorite = vi.fn().mockResolvedValue({
        id: 'fav-1',
        user_id: 'user-1',
        model_id: 'test-model-id',
        created_at: '2024-01-01T00:00:00Z',
      });

      vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
        const data = {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test User',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            role: 'brand' as const,
          },
          token: 'test-token',
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          register: vi.fn(),
          fetchUser: vi.fn(),
          clearError: vi.fn(),
          initialize: vi.fn(),
        };
        return selector ? selector(data) : data;
      });

      vi.mocked(favoriteService.addFavorite).mockImplementation(mockAddFavorite);

      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', { name: /찜하기/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith('test-model-id');
      });
    });

    // @TEST T1.4.2 - Show toast on favorite add
    it('should show toast message when favorite is added', async () => {
      const user = userEvent.setup();
      const mockAddToast = vi.fn();

      vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
        const data = {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test User',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            role: 'brand' as const,
          },
          token: 'test-token',
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          register: vi.fn(),
          fetchUser: vi.fn(),
          clearError: vi.fn(),
          initialize: vi.fn(),
        };
        return selector ? selector(data) : data;
      });

      vi.mocked(useUIStore).mockImplementation((selector?: any) => {
        const data = {
          isLoginModalOpen: false,
          openLoginModal: vi.fn(),
          closeLoginModal: vi.fn(),
          addToast: mockAddToast,
          removeToast: vi.fn(),
          toasts: [],
        };
        return selector ? selector(data) : data;
      });

      vi.mocked(favoriteService.addFavorite).mockResolvedValue({
        id: 'fav-1',
        user_id: 'user-1',
        model_id: 'test-model-id',
        created_at: '2024-01-01T00:00:00Z',
      });

      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      const favoriteButton = screen.getByRole('button', { name: /찜하기/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          variant: 'success',
          message: expect.stringContaining('찜'),
        });
      });
    });
  });

  describe('T1.5 - Contact button', () => {
    // @TEST T1.5.1 - Show toast when contact button clicked
    it('should show toast when 문의하기 button clicked (logged in)', async () => {
      const user = userEvent.setup();
      const mockAddToast = vi.fn();

      vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
        const data = {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test User',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            role: 'brand' as const,
          },
          token: 'test-token',
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          register: vi.fn(),
          fetchUser: vi.fn(),
          clearError: vi.fn(),
          initialize: vi.fn(),
        };
        return selector ? selector(data) : data;
      });

      vi.mocked(useUIStore).mockImplementation((selector?: any) => {
        const data = {
          isLoginModalOpen: false,
          openLoginModal: vi.fn(),
          closeLoginModal: vi.fn(),
          addToast: mockAddToast,
          removeToast: vi.fn(),
          toasts: [],
        };
        return selector ? selector(data) : data;
      });

      render(<ModelProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('테스트 모델')).toBeInTheDocument();
      });

      const contactButton = screen.getByRole('button', { name: /문의하기/i });
      await user.click(contactButton);

      expect(mockAddToast).toHaveBeenCalledWith({
        variant: 'info',
        message: expect.stringContaining('준비'),
      });
    });
  });
});
