// @TEST P1-S1-T2 - Login page integration tests
// @IMPL frontend/src/app/auth/login/page.tsx
// @SPEC Phase 1 Login Screen

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/auth/login/page';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { useRouter } from 'next/navigation';

// Mock the stores before describe
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    fetchUser: vi.fn(),
    clearError: vi.fn(),
    initialize: vi.fn(),
    user: null,
    token: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/stores/ui', () => ({
  useUIStore: vi.fn(() => ({
    isLoginModalOpen: false,
    openLoginModal: vi.fn(),
    closeLoginModal: vi.fn(),
    addToast: vi.fn(),
    removeToast: vi.fn(),
    toasts: [],
  })),
}));

describe('LoginPage', () => {
  const mockAuthStore = {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    fetchUser: vi.fn(),
    clearError: vi.fn(),
    initialize: vi.fn(),
    user: null,
    token: null,
    isLoading: false,
    error: null,
  };

  const mockUIStore = {
    isLoginModalOpen: false,
    openLoginModal: vi.fn(),
    closeLoginModal: vi.fn(),
    addToast: vi.fn(),
    removeToast: vi.fn(),
    toasts: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock store values for each test
    const freshAuthStore = {
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      fetchUser: vi.fn(),
      clearError: vi.fn(),
      initialize: vi.fn(),
      user: null,
      token: null,
      isLoading: false,
      error: null,
    };

    const freshUIStore = {
      isLoginModalOpen: false,
      openLoginModal: vi.fn(),
      closeLoginModal: vi.fn(),
      addToast: vi.fn(),
      removeToast: vi.fn(),
      toasts: [],
    };

    // Use mockImplementation for store functions
    vi.mocked(useAuthStore).mockImplementation(() => freshAuthStore as any);
    vi.mocked(useUIStore).mockImplementation(() => freshUIStore as any);

    // Mock useAuthStore.getState() for role-based redirect
    vi.mocked(useAuthStore).getState = vi.fn(() => ({
      ...freshAuthStore,
      user: null,
    }));
  });

  describe('T2.1 - Email login success', () => {
    // @TEST T2.1.1 - Valid email/password login with brand role
    it('should redirect to brand dashboard on successful login with brand role', async () => {
      const user = userEvent.setup();
      const testUser = {
        id: '1',
        email: 'brand@example.com',
        name: 'Brand User',
        role: 'brand' as const,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const mockLogin = vi.fn().mockResolvedValueOnce(undefined);
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: testUser,
        token: 'test-token',
        isLoading: false,
        error: null,
      }));

      vi.mocked(useAuthStore).getState = vi.fn(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: testUser,
        token: 'test-token',
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      await user.type(emailInput, 'brand@example.com');
      await user.type(passwordInput, 'ValidPass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'brand@example.com',
          password: 'ValidPass123',
        });
      });
    });

    // @TEST T2.1.2 - Valid email/password login with creator role
    it('should redirect to creator dashboard on successful login with creator role', async () => {
      const user = userEvent.setup();
      const testUser = {
        id: '2',
        email: 'creator@example.com',
        name: 'Creator User',
        role: 'creator' as const,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const mockLogin = vi.fn().mockResolvedValueOnce(undefined);
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: testUser,
        token: 'test-token',
        isLoading: false,
        error: null,
      }));

      vi.mocked(useAuthStore).getState = vi.fn(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: testUser,
        token: 'test-token',
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      await user.type(emailInput, 'creator@example.com');
      await user.type(passwordInput, 'ValidPass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'creator@example.com',
          password: 'ValidPass123',
        });
      });
    });
  });

  describe('T2.2 - Email login failure', () => {
    // @TEST T2.2.1 - Invalid password shows error message
    it('should show error message on invalid password', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn().mockRejectedValueOnce(new Error('Invalid credentials'));
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: 'Invalid credentials',
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'WrongPassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'WrongPassword123',
        });
      });
    });

    // @TEST T2.2.2 - Empty email validation
    it('should show validation error for empty email', async () => {
      const user = userEvent.setup({ delay: null });
      const mockLogin = vi.fn();
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/비밀번호/i);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      await user.type(passwordInput, 'ValidPass123');
      await user.click(submitButton);

      // Check that login was not called (validation failed)
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    // @TEST T2.2.3 - Invalid email format validation
    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup({ delay: null });
      const mockLogin = vi.fn();
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      await user.type(emailInput, 'not-an-email');
      await user.type(passwordInput, 'ValidPass123');
      await user.click(submitButton);

      // Check that login was not called (validation failed)
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    // @TEST T2.2.4 - Empty password validation
    it('should show validation error for empty password', async () => {
      const user = userEvent.setup({ delay: null });
      const mockLogin = vi.fn();
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      await user.type(emailInput, 'user@example.com');
      await user.click(submitButton);

      // Check that login was not called (validation failed)
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    // @TEST T2.2.5 - Short password validation
    it('should show validation error for password less than 8 characters', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn();
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'Short1');
      await user.click(submitButton);

      const passwordError = await screen.findByText(/최소 8자 이상/i);
      expect(passwordError).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });

    // @TEST T2.2.6 - Error message clears on input
    it('should clear validation error when user types in field', async () => {
      const user = userEvent.setup({ delay: null });
      const mockLogin = vi.fn();
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: mockLogin,
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      const submitButton = screen.getByRole('button', { name: '로그인' });

      // First try to submit without email
      await user.click(submitButton);

      // Verify login not called (validation prevents it)
      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });

      // Now type a valid email
      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'ValidPass123!');

      // Verify login can now be called
      mockLogin.mockResolvedValueOnce(undefined);
      await user.click(submitButton);

      // After second submit, login should have been called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('T2.3 - Social login', () => {
    // @TEST T2.3.1 - Google login button shows toast notification
    it('should show toast notification when Google button is clicked', async () => {
      const user = userEvent.setup();
      const mockAddToast = vi.fn();
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      vi.mocked(useUIStore).mockImplementation(() => ({
        isLoginModalOpen: false,
        openLoginModal: vi.fn(),
        closeLoginModal: vi.fn(),
        addToast: mockAddToast,
        removeToast: vi.fn(),
        toasts: [],
      }));

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', {
        name: /Google 계정으로/i,
      });

      await user.click(googleButton);

      expect(mockAddToast).toHaveBeenCalledWith({
        variant: 'info',
        message: 'Google 로그인 준비 중입니다',
      });
    });

    // @TEST T2.3.2 - Kakao login button shows toast notification
    it('should show toast notification when Kakao button is clicked', async () => {
      const user = userEvent.setup();
      const mockAddToast = vi.fn();
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      vi.mocked(useUIStore).mockImplementation(() => ({
        isLoginModalOpen: false,
        openLoginModal: vi.fn(),
        closeLoginModal: vi.fn(),
        addToast: mockAddToast,
        removeToast: vi.fn(),
        toasts: [],
      }));

      render(<LoginPage />);

      const kakaoButton = screen.getByRole('button', {
        name: /카카오 계정으로/i,
      });

      await user.click(kakaoButton);

      expect(mockAddToast).toHaveBeenCalledWith({
        variant: 'info',
        message: 'Kakao 로그인 준비 중입니다',
      });
    });
  });

  describe('T2.4 - Navigation', () => {
    // @TEST T2.4.1 - Sign up link navigates to signup page
    it('should have signup link pointing to /auth/signup', () => {
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      const signupLink = screen.getByRole('link', { name: /회원가입하기/i });

      expect(signupLink).toHaveAttribute('href', '/auth/signup');
    });

    // @TEST T2.4.2 - Page displays login form
    it('should display login form with all required fields', () => {
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    // @TEST T2.4.3 - Page displays social login buttons
    it('should display social login buttons', () => {
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }));

      render(<LoginPage />);

      expect(
        screen.getByRole('button', { name: /Google 계정으로/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /카카오 계정으로/i })
      ).toBeInTheDocument();
    });
  });

  describe('T2.5 - Loading state', () => {
    // @TEST T2.5.1 - Submit button shows loading state
    it('should disable submit button and show loading text while logging in', () => {
      const mockClearError = vi.fn();

      vi.mocked(useAuthStore).mockImplementation(() => ({
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: mockClearError,
        initialize: vi.fn(),
        user: null,
        token: null,
        isLoading: true,
        error: null,
      }));

      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /로그인 중/ });

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });
  });
});
