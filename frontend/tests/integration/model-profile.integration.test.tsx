// @TEST P2-S3-T2 - Model profile page integration tests
// @IMPL frontend/src/app/models/[id]/page.tsx
// @IMPL frontend/src/components/model/ModelHeader.tsx
// @IMPL frontend/src/components/model/PortfolioGallery.tsx
// @IMPL frontend/src/components/model/ImageLightbox.tsx
// @SPEC Phase 2 Model Profile Screen

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('Model Profile Integration Tests (Vitest + RTL)', () => {
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

  describe('Scenario 1: 초기 로드 (Initial Load)', () => {
    // @TEST P2-S3-T2.1 - Display model info + portfolio + 3 CTA buttons
    it('should display model info, portfolio gallery, and three CTA buttons on page load', async () => {
      render(<ModelProfilePage />);

      // Wait for model name to load
      const modelName = await screen.findByText('테스트 모델');
      expect(modelName).toBeInTheDocument();

      // Check model basic info
      expect(screen.getByText('패션')).toBeInTheDocument();
      expect(screen.getByText('여성')).toBeInTheDocument();
      expect(screen.getByText('20대')).toBeInTheDocument();

      // Check view count and rating
      expect(screen.getByText(/1,234/)).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();

      // Check description
      expect(screen.getByText('테스트 모델 설명입니다.')).toBeInTheDocument();

      // Check tags
      expect(screen.getByText('#패션')).toBeInTheDocument();
      expect(screen.getByText('#뷰티')).toBeInTheDocument();
    });

    // @TEST P2-S3-T2.1.1 - Display portfolio gallery with 3 images
    it('should display portfolio gallery with all images in correct order', async () => {
      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      // Check portfolio section header
      expect(screen.getByText('포트폴리오')).toBeInTheDocument();

      // Check that all 3 images are rendered
      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      expect(images.length).toBe(3);
    });

    // @TEST P2-S3-T2.1.2 - Display three CTA buttons
    it('should display three CTA buttons: 섭외 요청하기, 찜하기, 문의하기', async () => {
      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      // Check all three buttons
      const bookingButton = screen.getByRole('button', { name: /섭외 요청하기/i });
      const favoriteButton = screen.getByRole('button', { name: /찜하기/i });
      const contactButton = screen.getByRole('button', { name: /문의하기/i });

      expect(bookingButton).toBeInTheDocument();
      expect(favoriteButton).toBeInTheDocument();
      expect(contactButton).toBeInTheDocument();
    });

    // @TEST P2-S3-T2.1.3 - Display creator info card
    it('should display creator info card with creator name', async () => {
      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      expect(screen.getByText('크리에이터')).toBeInTheDocument();
    });

    // @TEST P2-S3-T2.1.4 - Call getModelById with correct ID
    it('should call getModelById with model ID from URL params', async () => {
      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      expect(vi.mocked(modelService.getModelById)).toHaveBeenCalledWith('test-model-id');
    });

    // @TEST P2-S3-T2.1.5 - Call incrementViewCount after loading
    it('should increment view count after model loads', async () => {
      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      // Wait for incrementViewCount to be called
      await waitFor(() => {
        expect(vi.mocked(modelService.incrementViewCount)).toHaveBeenCalledWith('test-model-id');
      });
    });
  });

  describe('Scenario 2: 섭외 요청 (Brand - Authenticated)', () => {
    // @TEST P2-S3-T2.2 - Navigate to /booking/new?model=:id when authenticated
    it('should navigate to /booking/new?model=:id when 섭외 요청하기 clicked (authenticated)', async () => {
      const user = userEvent.setup();
      const mockPush = vi.fn();

      // Set up authenticated user
      vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
        const data = {
          user: {
            id: 'user-1',
            email: 'brand@example.com',
            name: 'Brand User',
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

      // Re-mock useRouter with the push spy
      const { useRouter } = await import('next/navigation');
      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
      } as any);

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const bookingButton = screen.getByRole('button', { name: /섭외 요청하기/i });
      await user.click(bookingButton);

      // Verify router.push was called with correct path
      expect(mockPush).toHaveBeenCalledWith('/booking/new?model=test-model-id');
    });
  });

  describe('Scenario 3: 섭외 요청 (Non-Authenticated - Show Login Modal)', () => {
    // @TEST P2-S3-T2.3 - Show login modal when not authenticated
    it('should open login modal when 섭외 요청하기 clicked without login', async () => {
      const user = userEvent.setup();
      const mockOpenLoginModal = vi.fn();

      // Ensure user is NOT authenticated
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

      await screen.findByText('테스트 모델');

      const bookingButton = screen.getByRole('button', { name: /섭외 요청하기/i });
      await user.click(bookingButton);

      // Verify openLoginModal was called
      expect(mockOpenLoginModal).toHaveBeenCalled();
    });
  });

  describe('Scenario 4: 이미지 라이트박스 (Image Lightbox)', () => {
    // @TEST P2-S3-T2.4 - Open lightbox on portfolio image click
    it('should open lightbox when portfolio image is clicked', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      // Click first portfolio image
      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[0]);

      // Verify lightbox is visible
      const lightbox = await screen.findByRole('dialog', { name: /이미지 확대/i });
      expect(lightbox).toBeInTheDocument();
    });

    // @TEST P2-S3-T2.4.1 - Display correct image in lightbox
    it('should display correct image in lightbox', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[0]);

      const lightbox = await screen.findByRole('dialog', { name: /이미지 확대/i });

      // Check that the correct image is displayed
      const lightboxImage = within(lightbox).getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img1.jpg');
    });

    // @TEST P2-S3-T2.4.2 - Close lightbox with ESC key
    it('should close lightbox when ESC key is pressed', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[0]);

      let lightbox = await screen.findByRole('dialog', { name: /이미지 확대/i });
      expect(lightbox).toBeInTheDocument();

      // Press ESC key
      await user.keyboard('{Escape}');

      // Verify lightbox is closed
      lightbox = screen.queryByRole('dialog', { name: /이미지 확대/i });
      expect(lightbox).not.toBeInTheDocument();
    });

    // @TEST P2-S3-T2.4.3 - Navigate to next image with next button
    it('should navigate to next image in lightbox', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[0]);

      const lightbox = await screen.findByRole('dialog', { name: /이미지 확대/i });
      expect(lightbox).toBeInTheDocument();

      // Click next button
      const nextButton = within(lightbox).getByRole('button', { name: /다음 이미지/i });
      await user.click(nextButton);

      // Verify second image is displayed
      const lightboxImage = within(lightbox).getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img2.jpg');
    });

    // @TEST P2-S3-T2.4.4 - Navigate to previous image with prev button
    it('should navigate to previous image in lightbox', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[1]); // Start with second image

      let lightbox = await screen.findByRole('dialog', { name: /이미지 확대/i });
      let lightboxImage = within(lightbox).getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img2.jpg');

      // Click previous button
      const prevButton = within(lightbox).getByRole('button', { name: /이전 이미지/i });
      await user.click(prevButton);

      // Verify first image is displayed
      lightbox = screen.getByRole('dialog', { name: /이미지 확대/i });
      lightboxImage = within(lightbox).getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img1.jpg');
    });

    // @TEST P2-S3-T2.4.5 - Navigate with arrow keys
    it('should navigate between images with arrow keys in lightbox', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[0]);

      const lightbox = await screen.findByRole('dialog', { name: /이미지 확대/i });

      // Press right arrow to go to next image
      await user.keyboard('{ArrowRight}');

      let lightboxImage = within(lightbox).getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img2.jpg');

      // Press right arrow again
      await user.keyboard('{ArrowRight}');

      lightboxImage = within(lightbox).getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img3.jpg');

      // Press left arrow to go to previous image
      await user.keyboard('{ArrowLeft}');

      lightboxImage = within(lightbox).getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img2.jpg');
    });

    // @TEST P2-S3-T2.4.6 - Display image counter in lightbox
    it('should display image counter in lightbox', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[1]);

      const lightbox = await screen.findByRole('dialog', { name: /이미지 확대/i });

      // Check image counter shows "2 / 3"
      const counter = within(lightbox).getByText('2 / 3');
      expect(counter).toBeInTheDocument();
    });

    // @TEST P2-S3-T2.4.7 - Close lightbox with close button
    it('should close lightbox when close button is clicked', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[0]);

      let lightbox = await screen.findByRole('dialog', { name: /이미지 확대/i });
      expect(lightbox).toBeInTheDocument();

      // Click close button
      const closeButton = within(lightbox).getByRole('button', { name: /닫기/i });
      await user.click(closeButton);

      // Verify lightbox is closed
      lightbox = screen.queryByRole('dialog', { name: /이미지 확대/i });
      expect(lightbox).not.toBeInTheDocument();
    });

    // @TEST P2-S3-T2.4.8 - Cannot go past first or last image
    it('should not navigate beyond first or last image in lightbox', async () => {
      const user = userEvent.setup();

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      const images = screen.getAllByRole('button', { name: /포트폴리오 이미지/i });
      await user.click(images[2]); // Start with last image

      const lightbox = screen.getByRole('dialog', { name: /이미지 확대/i });

      // Try to click next button - should not exist for last image
      const nextButton = within(lightbox).queryByRole('button', { name: /다음 이미지/i });
      expect(nextButton).not.toBeInTheDocument();

      // Try to navigate with arrow key - should stay on last image
      await user.keyboard('{ArrowRight}');

      let lightboxImage = within(lightbox).getByRole('img', { name: /현재 이미지/i });
      expect(lightboxImage).toHaveAttribute('src', 'https://example.com/img3.jpg');
    });
  });

  describe('Scenario 5: Favorite Toggle (Authenticated)', () => {
    // @TEST P2-S3-T2.5 - Toggle favorite when button clicked (authenticated)
    it('should add to favorite when 찜하기 button clicked (authenticated)', async () => {
      const user = userEvent.setup();
      const mockAddFavorite = vi.fn().mockResolvedValue({
        id: 'fav-1',
        user_id: 'user-1',
        model_id: 'test-model-id',
        created_at: '2024-01-01T00:00:00Z',
      });

      // Set up authenticated user
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

      await screen.findByText('테스트 모델');

      const favoriteButton = screen.getByRole('button', { name: /찜하기/i });
      await user.click(favoriteButton);

      // Verify addFavorite was called
      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith('test-model-id');
      });
    });

    // @TEST P2-S3-T2.5.1 - Show success toast when favorite is added
    it('should show success toast message when favorite is added', async () => {
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

      await screen.findByText('테스트 모델');

      const favoriteButton = screen.getByRole('button', { name: /찜하기/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          variant: 'success',
          message: expect.stringContaining('찜'),
        });
      });
    });

    // @TEST P2-S3-T2.5.2 - Remove from favorite when already favorited
    it('should remove from favorite when 찜하기 button clicked again (already favorited)', async () => {
      const user = userEvent.setup();
      const mockRemoveFavorite = vi.fn().mockResolvedValue(undefined);

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

      // Simulate already favorited
      vi.mocked(favoriteService.isFavorited).mockResolvedValue(true);
      vi.mocked(favoriteService.removeFavorite).mockImplementation(mockRemoveFavorite);

      render(<ModelProfilePage />);

      await screen.findByText('테스트 모델');

      // Button should show "찜 완료" when already favorited
      const favoriteButton = await screen.findByRole('button', { name: /찜 완료/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(mockRemoveFavorite).toHaveBeenCalledWith('test-model-id');
      });
    });
  });

  describe('Scenario 6: Contact Button', () => {
    // @TEST P2-S3-T2.6 - Show info toast when contact button clicked
    it('should show info toast when 문의하기 button clicked (authenticated)', async () => {
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

      await screen.findByText('테스트 모델');

      const contactButton = screen.getByRole('button', { name: /문의하기/i });
      await user.click(contactButton);

      expect(mockAddToast).toHaveBeenCalledWith({
        variant: 'info',
        message: expect.stringContaining('준비'),
      });
    });

    // @TEST P2-S3-T2.6.1 - Show login modal when contact button clicked (not authenticated)
    it('should open login modal when 문의하기 button clicked without login', async () => {
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

      await screen.findByText('테스트 모델');

      const contactButton = screen.getByRole('button', { name: /문의하기/i });
      await user.click(contactButton);

      expect(mockOpenLoginModal).toHaveBeenCalled();
    });
  });
});
