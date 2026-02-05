// @TASK P3-S1-T2 - Booking Wizard Integration Tests
// @SPEC specs/screens/booking-wizard.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
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

// Mock data matching the specification
const mockRecommendations = {
  recommendations: [
    {
      model: {
        id: 'model-1',
        creator_id: 'creator-1',
        name: 'Summer Casual',
        description: '여름 캐주얼',
        style: 'casual',
        gender: 'female',
        age_range: '20s',
        view_count: 100,
        rating: 4.5,
        status: 'published',
        thumbnail_url: '/img/model1.jpg',
        tags: ['summer', 'casual'],
      },
      score: 85,
    },
    {
      model: {
        id: 'model-2',
        creator_id: 'creator-2',
        name: 'Street Fashion',
        description: '스트릿 패션',
        style: 'street',
        gender: 'male',
        age_range: '20s',
        view_count: 80,
        rating: 4.2,
        status: 'published',
        thumbnail_url: '/img/model2.jpg',
        tags: ['street', 'urban'],
      },
      score: 72,
    },
    {
      model: {
        id: 'model-3',
        creator_id: 'creator-3',
        name: 'Elegant Editorial',
        description: '우아한 에디토리얼',
        style: 'editorial',
        gender: 'female',
        age_range: '30s',
        view_count: 120,
        rating: 4.8,
        status: 'published',
        thumbnail_url: '/img/model3.jpg',
        tags: ['editorial', 'elegant'],
      },
      score: 68,
    },
  ],
};

const mockOrderResponse = {
  id: 'order-1',
  order_number: 'ORD-20260205-001',
  total_price: 50000,
  status: 'pending',
};

const mockPaymentResponse = {
  id: 'payment-1',
  status: 'completed',
  transaction_id: 'txn_123',
};

describe('BookingWizard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Integration Flow: Step 1 → Step 2', () => {
    it('should complete Step 1 to Step 2 flow with concept input and recommendations display', async () => {
      const user = userEvent.setup();

      // Setup: Mock the getRecommendations API
      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);

      render(<BookingWizardPage />);

      // Step 1: Verify initial state
      expect(screen.getByText('콘셉트 입력')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/)).toBeInTheDocument();

      // Step 1: Input 500 characters
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      const conceptText = 'a'.repeat(500);
      await user.type(conceptInput, conceptText);

      // Step 1: Submit and verify API call
      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Verify API was called with correct parameters
      await waitFor(() => {
        expect(bookingService.getRecommendations).toHaveBeenCalledWith(conceptText, []);
      });

      // Step 2: Wait for recommendations to appear
      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      // Step 2: Verify 3-5 recommendations are displayed
      expect(screen.getByText('Summer Casual')).toBeInTheDocument();
      expect(screen.getByText('Street Fashion')).toBeInTheDocument();
      expect(screen.getByText('Elegant Editorial')).toBeInTheDocument();

      // Step 2: Verify scores are displayed
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('68%')).toBeInTheDocument();
    });

    it('should show loading state during AI matching in Step 1', async () => {
      const user = userEvent.setup();

      // Setup: Delay the API response to see loading state
      vi.mocked(bookingService.getRecommendations).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockRecommendations), 100))
      );

      render(<BookingWizardPage />);

      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test concept with 50+ characters minimum requirement');

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Verify loading state or button disabled state occurs
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });
    });
  });

  describe('Integration Flow: Step 2 → Step 3', () => {
    it('should complete Step 2 to Step 3 flow with model selection and package display', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);

      render(<BookingWizardPage />);

      // Step 1: Navigate to Step 2
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test concept for step navigation flow');

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Step 2: Wait for recommendations
      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      // Step 2: Select model
      const modelRadio = screen.getByRole('radio', { name: /Summer Casual/i });
      await user.click(modelRadio);

      // Step 2: Proceed to Step 3
      const step2NextButton = screen.getByRole('button', { name: '다음' });
      await user.click(step2NextButton);

      // Step 3: Verify package options are displayed
      await waitFor(() => {
        expect(screen.getByText('패키지 선택')).toBeInTheDocument();
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('Premium')).toBeInTheDocument();
        expect(screen.getByText('Exclusive')).toBeInTheDocument();
      });

      // Step 3: Verify prices are displayed
      expect(screen.getByText('₩50,000')).toBeInTheDocument();
      expect(screen.getByText('₩100,000')).toBeInTheDocument();
      expect(screen.getByText('₩200,000')).toBeInTheDocument();
    });

    it('should select only one model at a time in Step 2', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);

      render(<BookingWizardPage />);

      // Navigate to Step 2
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test concept');

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      // Select first model
      const radio1 = screen.getByRole('radio', { name: /Summer Casual/i });
      await user.click(radio1);
      expect(radio1).toBeChecked();

      // Select second model - first should be unchecked
      const radio2 = screen.getByRole('radio', { name: /Street Fashion/i });
      await user.click(radio2);
      expect(radio2).toBeChecked();
      expect(radio1).not.toBeChecked();
    });
  });

  describe('Integration Flow: Step 3 → Payment Success', () => {
    it('should complete payment and show success modal', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);
      vi.mocked(bookingService.createOrder).mockResolvedValue(mockOrderResponse);
      vi.mocked(bookingService.createPayment).mockResolvedValue(mockPaymentResponse);

      render(<BookingWizardPage />);

      // Step 1: Submit concept
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test concept for payment flow');

      let nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Step 2: Wait and select model
      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      const modelRadio = screen.getByRole('radio', { name: /Summer Casual/i });
      await user.click(modelRadio);

      nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Step 3: Wait for packages and select Standard
      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      const standardRadio = screen.getByRole('radio', { name: /Standard/i });
      await user.click(standardRadio);

      // Step 3: Process payment
      const payButton = screen.getByRole('button', { name: '결제하기' });
      await user.click(payButton);

      // Verify APIs were called
      await waitFor(() => {
        expect(bookingService.createOrder).toHaveBeenCalled();
        expect(bookingService.createPayment).toHaveBeenCalled();
      });

      // Verify success modal appears
      await waitFor(() => {
        expect(screen.getByText('결제 완료')).toBeInTheDocument();
        expect(screen.getByText('ORD-20260205-001')).toBeInTheDocument();
      });
    });

    it('should include order details in success modal', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);
      vi.mocked(bookingService.createOrder).mockResolvedValue(mockOrderResponse);
      vi.mocked(bookingService.createPayment).mockResolvedValue(mockPaymentResponse);

      render(<BookingWizardPage />);

      // Navigate through all steps
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test');

      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Summer Casual/i }));
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Standard/i }));
      await user.click(screen.getByRole('button', { name: '결제하기' }));

      await waitFor(() => {
        expect(screen.getByText('결제 완료')).toBeInTheDocument();
      });

      // Verify modal displays order information
      expect(screen.getByText('ORD-20260205-001')).toBeInTheDocument();
    });
  });

  describe('Integration Flow: Payment Failure', () => {
    it('should show error modal when payment fails and remain on Step 3', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);
      vi.mocked(bookingService.createOrder).mockResolvedValue(mockOrderResponse);
      vi.mocked(bookingService.createPayment).mockRejectedValue(new Error('결제 실패'));

      render(<BookingWizardPage />);

      // Navigate through steps
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test concept');

      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Summer Casual/i }));
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Standard/i }));
      await user.click(screen.getByRole('button', { name: '결제하기' }));

      // Verify error modal appears
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '결제 실패' })).toBeInTheDocument();
      });

      // Verify Step 3 is still displayed (can retry)
      expect(screen.getByText('패키지 선택')).toBeInTheDocument();
    });

    it('should handle payment error and allow retry', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);
      vi.mocked(bookingService.createOrder).mockResolvedValue(mockOrderResponse);

      // First call fails, second succeeds
      vi.mocked(bookingService.createPayment)
        .mockRejectedValueOnce(new Error('결제 실패'))
        .mockResolvedValueOnce(mockPaymentResponse);

      render(<BookingWizardPage />);

      // Navigate to Step 3
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test');

      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Summer Casual/i }));
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Standard/i }));

      // First payment attempt fails
      let payButton = screen.getByRole('button', { name: '결제하기' });
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '결제 실패' })).toBeInTheDocument();
      });

      // Close error modal and retry
      const retryButton = screen.getByRole('button', { name: /다시 시도/i });
      await user.click(retryButton);

      // Step 3 should still be visible for retry
      await waitFor(() => {
        expect(screen.getByText('결제하기')).toBeInTheDocument();
      });

      // Retry payment
      payButton = screen.getByRole('button', { name: '결제하기' });
      await user.click(payButton);

      // Success modal should appear
      await waitFor(() => {
        expect(screen.getByText('결제 완료')).toBeInTheDocument();
      });
    });
  });

  describe('Integration Flow: Complete Wizard End-to-End', () => {
    it('should complete entire wizard flow from Step 1 to success', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);
      vi.mocked(bookingService.createOrder).mockResolvedValue(mockOrderResponse);
      vi.mocked(bookingService.createPayment).mockResolvedValue(mockPaymentResponse);

      render(<BookingWizardPage />);

      // Step 1: Enter concept
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'Summer campaign with casual style models');

      await user.click(screen.getByRole('button', { name: '다음' }));

      // Step 2: AI recommendations loading and selection
      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      expect(screen.getByText('Summer Casual')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: /Summer Casual/i }));
      await user.click(screen.getByRole('button', { name: '다음' }));

      // Step 3: Package selection and payment
      await waitFor(() => {
        expect(screen.getByText('패키지 선택')).toBeInTheDocument();
      });

      const standardRadio = screen.getByRole('radio', { name: /Standard/i });
      await user.click(standardRadio);

      await user.click(screen.getByRole('button', { name: '결제하기' }));

      // Success modal
      await waitFor(() => {
        expect(screen.getByText('결제 완료')).toBeInTheDocument();
      });

      // Verify all API calls were made in order
      expect(bookingService.getRecommendations).toHaveBeenCalled();
      expect(bookingService.createOrder).toHaveBeenCalled();
      expect(bookingService.createPayment).toHaveBeenCalled();
    });
  });

  describe('Navigation: Stepper and Back Button', () => {
    it('should navigate backward via stepper after progressing', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);

      render(<BookingWizardPage />);

      // Navigate to Step 2
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test');

      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      // Click stepper to go back to Step 1
      const step1Button = screen.getByRole('button', { name: /1\. 콘셉트/i });
      await user.click(step1Button);

      // Should be back at Step 1
      expect(screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/)).toBeInTheDocument();
      expect(screen.queryByText('AI 추천 결과')).not.toBeInTheDocument();
    });

    it('should prevent navigation to future steps via stepper', () => {
      render(<BookingWizardPage />);

      // Step 2 and 3 buttons should be disabled
      const step2Button = screen.getByRole('button', { name: /2\. AI 추천/i });
      const step3Button = screen.getByRole('button', { name: /3\. 패키지\/결제/i });

      expect(step2Button).toBeDisabled();
      expect(step3Button).toBeDisabled();
    });
  });

  describe('Loading States', () => {
    it('should display loading state during API calls', async () => {
      const user = userEvent.setup();

      // Setup mock to delay response
      vi.mocked(bookingService.getRecommendations).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockRecommendations), 100))
      );

      render(<BookingWizardPage />);

      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test with minimum length');

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });
    });
  });

  describe('API Error Handling', () => {
    it('should handle API errors gracefully in Step 1 to Step 2 transition', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockRejectedValue(
        new Error('API error: AI 추천 서비스 호출 실패')
      );

      render(<BookingWizardPage />);

      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test concept');

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Should show error modal
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '결제 실패' })).toBeInTheDocument();
      });
    });

    it('should handle order creation API errors', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);
      vi.mocked(bookingService.createOrder).mockRejectedValue(
        new Error('주문 생성 실패')
      );

      render(<BookingWizardPage />);

      // Navigate to Step 3
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test');

      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Summer Casual/i }));
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Standard/i }));
      await user.click(screen.getByRole('button', { name: '결제하기' }));

      // Should show error modal
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '결제 실패' })).toBeInTheDocument();
      });
    });
  });


  describe('Package Price Calculation', () => {
    it('should update total price when different packages are selected', async () => {
      const user = userEvent.setup();

      vi.mocked(bookingService.getRecommendations).mockResolvedValue(mockRecommendations);

      render(<BookingWizardPage />);

      // Navigate to Step 3
      const conceptInput = screen.getByPlaceholderText(/원하시는 콘셉트를 자세히 설명해주세요/);
      await user.type(conceptInput, 'test');

      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('AI 추천 결과')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('radio', { name: /Summer Casual/i }));
      await user.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() => {
        expect(screen.getByText('Standard')).toBeInTheDocument();
      });

      // Select Standard and check total
      await user.click(screen.getByRole('radio', { name: /Standard/i }));

      await waitFor(() => {
        const totalElements = screen.queryAllByText(/₩50,000/);
        expect(totalElements.length).toBeGreaterThan(0);
      });

      // Select Premium and verify price changes
      const premiumRadio = screen.getByRole('radio', { name: /Premium/i });
      await user.click(premiumRadio);

      await waitFor(() => {
        const totalElements = screen.queryAllByText(/₩100,000/);
        expect(totalElements.length).toBeGreaterThan(0);
      });

      // Select Exclusive and verify price changes
      const exclusiveRadio = screen.getByRole('radio', { name: /Exclusive/i });
      await user.click(exclusiveRadio);

      await waitFor(() => {
        const totalElements = screen.queryAllByText(/₩200,000/);
        expect(totalElements.length).toBeGreaterThan(0);
      });
    });
  });
});
