/**
 * @TEST P1-S2-T2 - 회원가입 통합 테스트
 * @SPEC docs/planning/03-user-flow.md#회원가입
 *
 * Component Test: 회원가입 페이지
 * - Step 1: 역할 선택 (브랜드/크리에이터)
 * - Step 2: 정보 입력 (이메일, 비밀번호, 닉네임, 회사명)
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import SignupPage from '@/app/auth/signup/page';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { mockPush } from '../setup';

/**
 * Mock Zustand auth store
 */
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    register: vi.fn(),
    clearError: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    fetchUser: vi.fn(),
    initialize: vi.fn(),
  })),
}));

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @TEST P1-S2-T2.1 - 브랜드 가입 성공
   * 브랜드 역할을 선택하고 정보를 입력하면 /dashboard/brand로 이동
   */
  it('should successfully register as brand and redirect to /dashboard/brand', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn();

    // Mock auth store with successful registration
    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: {
        id: 'user-123',
        email: 'brand@example.com',
        name: 'Brand Name',
        nickname: 'brand_nick',
        role: 'brand',
        company_name: 'Brand Company',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      token: 'test-token',
      isLoading: false,
      error: null,
      register: mockRegister,
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Step 1: Select brand role
    const brandCard = screen.getByText(/브랜드 \(광고주\)/);
    await user.click(brandCard);

    // Verify brand card is selected (has yellow border)
    const brandButton = brandCard.closest('button');
    expect(brandButton).toHaveClass('border-[#c8ff00]');

    // Click next button
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/정보 입력/)).toBeInTheDocument();
    });

    // Step 2: Fill in the form
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);
    const nicknameInput = screen.getByLabelText(/닉네임/);
    const companyInput = screen.getByLabelText(/회사명/);

    await user.type(emailInput, 'brand@example.com');
    await user.type(passwordInput, 'SecurePass123!');
    await user.type(passwordConfirmInput, 'SecurePass123!');
    await user.type(nicknameInput, 'brand_nick');
    await user.type(companyInput, 'Brand Company');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /회원가입/ });
    await user.click(submitButton);

    // Verify register was called with correct data
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'brand@example.com',
        password: 'SecurePass123!',
        nickname: 'brand_nick',
        role: 'brand',
        company_name: 'Brand Company',
      });
    });

    // Verify redirect to brand dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/brand');
    });
  });

  /**
   * @TEST P1-S2-T2.2 - 크리에이터 가입 성공
   * 크리에이터 역할을 선택하고 정보를 입력하면 /dashboard/creator로 이동
   */
  it('should successfully register as creator and redirect to /dashboard/creator', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn();

    // Mock auth store with successful registration
    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: {
        id: 'creator-456',
        email: 'creator@example.com',
        name: 'Creator Name',
        nickname: 'creator_nick',
        role: 'creator',
        company_name: undefined,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      token: 'test-token',
      isLoading: false,
      error: null,
      register: mockRegister,
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Step 1: Select creator role
    const creatorCard = screen.getByText(/크리에이터 \(모델 제작자\)/);
    await user.click(creatorCard);

    // Verify creator card is selected
    const creatorButton = creatorCard.closest('button');
    expect(creatorButton).toHaveClass('border-[#c8ff00]');

    // Click next button
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/정보 입력/)).toBeInTheDocument();
    });

    // Step 2: Fill in the form (no company name field for creator)
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);
    const nicknameInput = screen.getByLabelText(/닉네임/);

    await user.type(emailInput, 'creator@example.com');
    await user.type(passwordInput, 'CreatorPass456!');
    await user.type(passwordConfirmInput, 'CreatorPass456!');
    await user.type(nicknameInput, 'creator_nick');

    // Verify company name field is NOT visible for creator role
    expect(screen.queryByLabelText(/회사명/)).not.toBeInTheDocument();

    // Submit form
    const submitButton = screen.getByRole('button', { name: /회원가입/ });
    await user.click(submitButton);

    // Verify register was called with correct data (no company_name)
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'creator@example.com',
        password: 'CreatorPass456!',
        nickname: 'creator_nick',
        role: 'creator',
        company_name: undefined,
      });
    });

    // Verify redirect to creator dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/creator');
    });
  });

  /**
   * @TEST P1-S2-T2.3 - 비밀번호 유효성 검사 (7자)
   * 비밀번호가 7자일 때 에러 메시지 표시
   */
  it('should show password validation error when password is less than 8 characters', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      register: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Step 1: Select brand role
    const brandCard = screen.getByText(/브랜드 \(광고주\)/);
    await user.click(brandCard);

    // Click next
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/정보 입력/)).toBeInTheDocument();
    });

    // Fill form with 7-char password
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);
    const nicknameInput = screen.getByLabelText(/닉네임/);
    const companyInput = screen.getByLabelText(/회사명/);

    await user.type(emailInput, 'brand@example.com');
    await user.type(passwordInput, 'Short7');
    await user.type(passwordConfirmInput, 'Short7');
    await user.type(nicknameInput, 'brand_nick');
    await user.type(companyInput, 'Company');

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /회원가입/ });
    await user.click(submitButton);

    // Verify password error message
    await waitFor(() => {
      expect(
        screen.getByText(/비밀번호는 최소 8자 이상이어야 합니다/)
      ).toBeInTheDocument();
    });
  });

  /**
   * @TEST P1-S2-T2.4 - 이메일 중복 검사
   * 기존 이메일로 가입 시도 시 에러 메시지 표시
   */
  it('should show error message when email already exists', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockRejectedValueOnce(
      new Error('Email already exists')
    );

    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: null,
      token: null,
      isLoading: false,
      error: 'Email already exists',
      register: mockRegister,
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Step 1: Select creator role
    const creatorCard = screen.getByText(/크리에이터 \(모델 제작자\)/);
    await user.click(creatorCard);

    // Click next
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/정보 입력/)).toBeInTheDocument();
    });

    // Fill form
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);
    const nicknameInput = screen.getByLabelText(/닉네임/);

    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(passwordConfirmInput, 'ValidPass123!');
    await user.type(nicknameInput, 'nick');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /회원가입/ });
    await user.click(submitButton);

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Email already exists/)).toBeInTheDocument();
    });
  });

  /**
   * @TEST P1-S2-T2.5 - 비밀번호 강도 표시
   * 비밀번호 입력 시 강도 표시 (약함/보통/강함)
   */
  it('should display password strength indicator', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      register: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Step 1: Select brand
    const brandCard = screen.getByText(/브랜드 \(광고주\)/);
    await user.click(brandCard);

    // Click next
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/정보 입력/)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/^비밀번호$/);

    // Type weak password (short)
    await user.type(passwordInput, 'short');
    expect(screen.getByText(/약함/)).toBeInTheDocument();

    // Clear and type medium strength password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Medium123');
    expect(screen.getByText(/보통/)).toBeInTheDocument();

    // Clear and type strong password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'VeryStrong@Pass123!');
    expect(screen.getByText(/강함/)).toBeInTheDocument();
  });

  /**
   * @TEST P1-S2-T2.6 - 닉네임 유효성 검사
   * 닉네임이 2-20자가 아닐 때 에러 메시지 표시
   */
  it('should show nickname validation error when length is outside 2-20 range', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      register: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Step 1: Select creator
    const creatorCard = screen.getByText(/크리에이터 \(모델 제작자\)/);
    await user.click(creatorCard);

    // Click next
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/정보 입력/)).toBeInTheDocument();
    });

    // Fill form with 1-char nickname
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);
    const nicknameInput = screen.getByLabelText(/닉네임/);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(passwordConfirmInput, 'ValidPass123!');
    await user.type(nicknameInput, 'x');

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /회원가입/ });
    await user.click(submitButton);

    // Verify nickname error message
    await waitFor(() => {
      expect(
        screen.getByText(/닉네임은 2-20자 사이여야 합니다/)
      ).toBeInTheDocument();
    });
  });

  /**
   * @TEST P1-S2-T2.7 - 역할 미선택 검증
   * Step 1에서 역할을 선택하지 않고 다음을 누르면 에러 메시지 표시
   */
  it('should show error when trying to proceed without selecting role', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      register: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Click next without selecting role
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Verify error message (get the one in the p tag, not the h2)
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/역할을 선택해주세요/);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    // Verify we're still on Step 1 (check that step 2 header is not shown)
    expect(screen.queryByText(/정보 입력/)).not.toBeInTheDocument();
  });

  /**
   * @TEST P1-S2-T2.8 - 회사명 필수 입력 (브랜드 역할)
   * 브랜드 역할 시 회사명을 입력하지 않으면 에러 메시지 표시
   */
  it('should show error when company name is missing for brand role', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      register: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Step 1: Select brand
    const brandCard = screen.getByText(/브랜드 \(광고주\)/);
    await user.click(brandCard);

    // Click next
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/정보 입력/)).toBeInTheDocument();
    });

    // Fill form WITHOUT company name
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);
    const nicknameInput = screen.getByLabelText(/닉네임/);

    await user.type(emailInput, 'brand@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(passwordConfirmInput, 'ValidPass123!');
    await user.type(nicknameInput, 'brand_nick');

    // Try to submit without company name
    const submitButton = screen.getByRole('button', { name: /회원가입/ });
    await user.click(submitButton);

    // Verify company name error message
    await waitFor(() => {
      expect(screen.getByText(/회사명을 입력해주세요/)).toBeInTheDocument();
    });
  });

  /**
   * @TEST P1-S2-T2.9 - 비밀번호 불일치
   * 비밀번호와 비밀번호 확인이 일치하지 않으면 에러 메시지 표시
   */
  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthStore).mockImplementation(() => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      register: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      initialize: vi.fn(),
    }));

    render(<SignupPage />);

    // Step 1: Select creator
    const creatorCard = screen.getByText(/크리에이터 \(모델 제작자\)/);
    await user.click(creatorCard);

    // Click next
    const nextButton = screen.getByRole('button', { name: /다음/ });
    await user.click(nextButton);

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText(/정보 입력/)).toBeInTheDocument();
    });

    // Fill form with mismatched passwords
    const emailInput = screen.getByLabelText(/이메일/);
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);
    const nicknameInput = screen.getByLabelText(/닉네임/);

    await user.type(emailInput, 'creator@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(passwordConfirmInput, 'DifferentPass123!');
    await user.type(nicknameInput, 'creator_nick');

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /회원가입/ });
    await user.click(submitButton);

    // Verify mismatch error message
    await waitFor(() => {
      expect(screen.getByText(/비밀번호가 일치하지 않습니다/)).toBeInTheDocument();
    });
  });
});
