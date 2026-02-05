// @TASK P3-S1-T1 - Booking Wizard UI Tests
// @SPEC specs/screens/booking-wizard.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingWizardPage from '@/app/booking/new/page';

// Mock Zustand auth store with selector support
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn((selector?: <T>(state: { user: { id: string; email: string; role: string; nickname: string } | null; token: string | null; isLoading: boolean; error: string | null }) => T) => {
    const state = {
      user: { id: '1', email: 'brand@test.com', role: 'brand', nickname: 'TestBrand' },
      token: 'mock-token',
      isLoading: false,
      error: null,
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock booking service
vi.mock('@/services/booking', () => ({
  bookingService: {
    getRecommendations: vi.fn(),
    createOrder: vi.fn(),
    createPayment: vi.fn(),
  },
}));

// Import mocked service for manipulation in tests
import { bookingService } from '@/services/booking';

describe('BookingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Test 1: 페이지 렌더링 (Step 1 표시)', () => {
    it('renders Step 1 concept form initially', async () => {
      render(<BookingWizardPage />);

      expect(screen.getByText('콘셉트 입력')).toBeInTheDocument();

      // Use more flexible query for textarea
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      expect(conceptInput).toBeInTheDocument();
    });

    it('shows stepper with current step highlighted', () => {
      render(<BookingWizardPage />);

      const stepperItems = screen.getAllByRole('listitem');
      expect(stepperItems).toHaveLength(3);
      expect(screen.getByText('1. 콘셉트')).toBeInTheDocument();
      expect(screen.getByText('2. AI 추천')).toBeInTheDocument();
      expect(screen.getByText('3. 패키지/결제')).toBeInTheDocument();
    });
  });

  describe('Test 2: 콘셉트 입력 후 제출', () => {
    it('submits concept and moves to Step 2', async () => {
      const user = userEvent.setup();

      // Mock AI recommendations response
      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              creator_id: 'creator-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: 'https://example.com/model1.jpg',
              tags: ['캐주얼', '20대'],
            },
            score: 95,
          },
        ],
      });

      render(<BookingWizardPage />);

      // Fill concept form
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '캐주얼한 여름 휴가 콘셉트');

      // Submit
      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Wait for Step 2
      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      expect(bookingService.getRecommendations).toHaveBeenCalledWith(
        '캐주얼한 여름 휴가 콘셉트',
        []
      );
    });

    it('validates concept description is required', async () => {
      const user = userEvent.setup();
      render(<BookingWizardPage />);

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      expect(screen.getByText('콘셉트 설명을 입력해주세요.')).toBeInTheDocument();
    });

    it('validates concept description max length 500', async () => {
      const user = userEvent.setup();
      render(<BookingWizardPage />);

      const longText = 'a'.repeat(501);
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, longText);

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      expect(screen.getByText('콘셉트 설명은 최대 500자까지 입력 가능합니다.')).toBeInTheDocument();
    });
  });

  describe('Test 3: Step 2 AI 추천 표시', () => {
    it('displays AI recommendation cards', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              creator_id: 'creator-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: 'https://example.com/model1.jpg',
              tags: ['캐주얼', '20대'],
            },
            score: 95,
          },
          {
            model: {
              id: 'model-2',
              creator_id: 'creator-2',
              name: '박수연',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 200,
              rating: 4.8,
              status: 'published',
              thumbnail_url: 'https://example.com/model2.jpg',
              tags: ['캐주얼', '20대'],
            },
            score: 88,
          },
        ],
      });

      render(<BookingWizardPage />);

      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '캐주얼한 콘셉트');

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('서진아')).toBeInTheDocument();
        expect(screen.getByText('박수연')).toBeInTheDocument();
        expect(screen.getByText('95%')).toBeInTheDocument();
        expect(screen.getByText('88%')).toBeInTheDocument();
      });
    });
  });

  describe('Test 4: 모델 선택 후 Step 3 이동', () => {
    it('selects model and moves to Step 3', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              creator_id: 'creator-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: 'https://example.com/model1.jpg',
              tags: ['캐주얼', '20대'],
            },
            score: 95,
          },
        ],
      });

      render(<BookingWizardPage />);

      // Step 1
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '캐주얼한 콘셉트');
      await user.click(screen.getByRole('button', { name: '다음' }));

      // Step 2 - Select model
      await waitFor(() => {
        expect(screen.getByText('서진아')).toBeInTheDocument();
      });

      const modelRadio = screen.getByRole('radio', { name: /서진아/i });
      await user.click(modelRadio);

      await user.click(screen.getByRole('button', { name: '다음' }));

      // Step 3
      await waitFor(() => {
        expect(screen.getByText('패키지 선택')).toBeInTheDocument();
      });
    });

    it('requires model selection before proceeding', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: null,
              tags: [],
            },
            score: 95,
          },
        ],
      });

      render(<BookingWizardPage />);

      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '캐주얼한 콘셉트');
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('서진아')).toBeInTheDocument();
      });

      // Try to proceed without selection
      await user.click(screen.getByRole('button', { name: '다음' }));

      expect(screen.getByText('모델을 선택해주세요.')).toBeInTheDocument();
    });
  });

  describe('Test 5-6: 패키지 선택 및 금액 업데이트', () => {
    it('displays package options', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: null,
              tags: [],
            },
            score: 95,
          },
        ],
      });

      render(<BookingWizardPage />);

      // Navigate to Step 3
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '테스트 콘셉트');
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('서진아')).toBeInTheDocument();
      });

      const modelRadio = screen.getByRole('radio', { name: /서진아/i });
      await user.click(modelRadio);
      await user.click(screen.getByRole('button', { name: '다음' }));

      // Check packages
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('Premium')).toBeInTheDocument();
        expect(screen.getByText('Exclusive')).toBeInTheDocument();
        expect(screen.getByText('₩50,000')).toBeInTheDocument();
        expect(screen.getByText('₩100,000')).toBeInTheDocument();
        expect(screen.getByText('₩200,000')).toBeInTheDocument();
      });
    });

    it('updates total price when package changes', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: null,
              tags: [],
            },
            score: 95,
          },
        ],
      });

      render(<BookingWizardPage />);

      // Navigate to Step 3
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '테스트 콘셉트');
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('서진아')).toBeInTheDocument();
      });

      const modelRadio = screen.getByRole('radio', { name: /서진아/i });
      await user.click(modelRadio);
      await user.click(screen.getByRole('button', { name: '다음' }));

      // Select Premium
      await waitFor(() => {
        expect(screen.getByText('Premium')).toBeInTheDocument();
      });

      const premiumRadio = screen.getByRole('radio', { name: /Premium/i });
      await user.click(premiumRadio);

      // Check for total amount section
      await waitFor(() => {
        expect(screen.getByText(/총 금액:/)).toBeInTheDocument();
        // Get all elements with ₩100,000 and check if at least one exists
        const priceElements = screen.getAllByText(/₩100,000/);
        expect(priceElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Test 7: 결제 성공 모달 표시', () => {
    it('shows success modal after payment', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: null,
              tags: [],
            },
            score: 95,
          },
        ],
      });

      vi.mocked(bookingService.createOrder).mockResolvedValue({
        id: 'order-1',
        order_number: 'ORD-2026-001',
        total_price: 50000,
        status: 'pending',
      });

      vi.mocked(bookingService.createPayment).mockResolvedValue({
        id: 'payment-1',
        status: 'completed',
        transaction_id: 'TXN-123',
      });

      render(<BookingWizardPage />);

      // Navigate to Step 3
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '테스트 콘셉트');
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('서진아')).toBeInTheDocument();
      });

      const modelRadio = screen.getByRole('radio', { name: /서진아/i });
      await user.click(modelRadio);
      await user.click(screen.getByRole('button', { name: '다음' }));

      // Select package and pay
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      const standardRadio = screen.getByRole('radio', { name: /Standard/i });
      await user.click(standardRadio);

      const payButton = screen.getByRole('button', { name: '결제하기' });
      await user.click(payButton);

      // Check success modal
      await waitFor(() => {
        expect(screen.getByText('결제 완료')).toBeInTheDocument();
        expect(screen.getByText('ORD-2026-001')).toBeInTheDocument();
      });
    });
  });

  describe('Test 8: 결제 실패 에러 모달', () => {
    it('shows error modal on payment failure', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: null,
              tags: [],
            },
            score: 95,
          },
        ],
      });

      vi.mocked(bookingService.createOrder).mockResolvedValue({
        id: 'order-1',
        order_number: 'ORD-2026-001',
        total_price: 50000,
        status: 'pending',
      });

      vi.mocked(bookingService.createPayment).mockRejectedValue(new Error('결제 실패'));

      render(<BookingWizardPage />);

      // Navigate to Step 3
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '테스트 콘셉트');
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('서진아')).toBeInTheDocument();
      });

      const modelRadio = screen.getByRole('radio', { name: /서진아/i });
      await user.click(modelRadio);
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      const standardRadio = screen.getByRole('radio', { name: /Standard/i });
      await user.click(standardRadio);

      const payButton = screen.getByRole('button', { name: '결제하기' });
      await user.click(payButton);

      // Check error modal (use role to find the modal heading)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '결제 실패' })).toBeInTheDocument();
      });
    });
  });

  describe('Test 9: 스텝퍼 클릭으로 이전 단계 이동', () => {
    it('navigates back to Step 1 when clicking stepper', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue({
        recommendations: [
          {
            model: {
              id: 'model-1',
              name: '서진아',
              style: 'casual',
              gender: 'female',
              age_range: '20s',
              view_count: 100,
              rating: 4.5,
              status: 'published',
              thumbnail_url: null,
              tags: [],
            },
            score: 95,
          },
        ],
      });

      render(<BookingWizardPage />);

      // Navigate to Step 2
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, '테스트 콘셉트');
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      // Click Step 1 in stepper
      const step1Button = screen.getByRole('button', { name: /1\. 콘셉트/i });
      await user.click(step1Button);

      // Should be back at Step 1
      expect(screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/)).toBeInTheDocument();
    });

    it('cannot navigate to future steps via stepper', async () => {
      const user = userEvent.setup();
      render(<BookingWizardPage />);

      // Try to click Step 2 (should be disabled)
      const step2Button = screen.getByRole('button', { name: /2\. AI 추천/i });
      expect(step2Button).toBeDisabled();
    });
  });

  describe('Test 10: 비인증 시 접근 제한', () => {
    it('redirects when user is not authenticated', () => {
      // Mock unauthenticated state
      vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
        const state = {
          user: null,
          token: null,
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<BookingWizardPage />);

      expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument();
    });

    it('shows access denied when user is not brand', () => {
      // Mock non-brand user
      vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
        const state = {
          user: { id: '1', email: 'creator@test.com', role: 'creator', nickname: 'Creator' },
          token: 'mock-token',
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<BookingWizardPage />);

      expect(screen.getByText('브랜드 회원만 이용 가능합니다.')).toBeInTheDocument();
    });
  });
});

// Import useAuthStore for mocking manipulation
import { useAuthStore } from '@/stores/auth';
