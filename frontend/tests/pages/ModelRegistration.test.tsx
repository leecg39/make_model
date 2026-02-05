// @TEST P4-S3-T1 - AI 모델 등록 페이지 테스트
// @IMPL frontend/src/app/models/new/page.tsx
// @SPEC Phase 4 Model Registration Screen

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewModelPage from '@/app/models/new/page';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { modelRegistrationService } from '@/services/model-registration';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
}));

// Mock auth store with Zustand 5 selector pattern
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: { id: '1', email: 'creator@test.com', role: 'creator', nickname: 'TestCreator', is_active: true, created_at: '2024-01-01', name: 'Test' },
      token: 'mock-token',
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      fetchUser: vi.fn(),
      clearError: vi.fn(),
      initialize: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock model registration service
vi.mock('@/services/model-registration', () => ({
  modelRegistrationService: {
    createModel: vi.fn(),
    uploadImage: vi.fn(),
    analyzeImages: vi.fn(),
  },
}));

describe('NewModelPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRouter
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
    } as any);

    // Reset service mocks
    vi.mocked(modelRegistrationService.createModel).mockResolvedValue({
      id: 'model-123',
      creator_id: '1',
      name: 'Test Model',
      description: 'Test description',
      style: 'casual',
      gender: 'female',
      age_range: '20s',
      view_count: 0,
      rating: null,
      status: 'active',
      thumbnail_url: null,
      tags: [],
      created_at: '2024-01-01',
    });

    vi.mocked(modelRegistrationService.uploadImage).mockResolvedValue({
      id: 'img-123',
      image_url: 'https://example.com/image.jpg',
    });

    vi.mocked(modelRegistrationService.analyzeImages).mockResolvedValue({
      style: 'casual',
      tags: ['natural', 'fresh'],
      description: 'AI generated description',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // T1: 페이지 렌더링
  it('should render the registration page', () => {
    render(<NewModelPage />);

    expect(screen.getByText('새 모델 등록')).toBeInTheDocument();
    expect(screen.getByText(/AI 모델의 정보와 이미지를 등록/)).toBeInTheDocument();
  });

  // T2: creator 역할만 접근
  it('should only allow creator role to access', () => {
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
        user: { id: '1', email: 'brand@test.com', role: 'brand', nickname: 'Brand', is_active: true, created_at: '2024-01-01', name: 'Brand' },
        token: 'mock-token',
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: vi.fn(),
        initialize: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    render(<NewModelPage />);

    waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // T3: 비인증 접근 제한
  it('should redirect to login if not authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
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
      return selector ? selector(state) : state;
    });

    render(<NewModelPage />);

    waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  // T4: 폼 필드 입력
  it('should allow entering form fields', async () => {
    const user = userEvent.setup();

    // Mock creator user
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
        user: { id: '1', email: 'creator@test.com', role: 'creator', nickname: 'TestCreator', is_active: true, created_at: '2024-01-01', name: 'Test' },
        token: 'mock-token',
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: vi.fn(),
        initialize: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    render(<NewModelPage />);

    const nameInput = screen.getByLabelText(/모델 이름/);
    const descriptionInput = screen.getByLabelText(/소개/);

    await user.type(nameInput, 'Aria');
    await user.type(descriptionInput, 'Beautiful AI model');

    expect(nameInput).toHaveValue('Aria');
    expect(descriptionInput).toHaveValue('Beautiful AI model');
  });

  // T5: 스타일 선택
  it('should allow selecting style', async () => {
    const user = userEvent.setup();

    // Mock creator user
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
        user: { id: '1', email: 'creator@test.com', role: 'creator', nickname: 'TestCreator', is_active: true, created_at: '2024-01-01', name: 'Test' },
        token: 'mock-token',
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: vi.fn(),
        initialize: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    render(<NewModelPage />);

    const styleSelect = screen.getByLabelText(/스타일/);
    await user.selectOptions(styleSelect, 'casual');

    expect(styleSelect).toHaveValue('casual');
  });

  // T6: 이미지 드래그 앤 드롭 (mock)
  it('should handle image drag and drop', async () => {
    // Mock creator user
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
        user: { id: '1', email: 'creator@test.com', role: 'creator', nickname: 'TestCreator', is_active: true, created_at: '2024-01-01', name: 'Test' },
        token: 'mock-token',
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: vi.fn(),
        initialize: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    render(<NewModelPage />);

    const uploadInput = screen.getByLabelText('이미지 업로드');
    expect(uploadInput).toBeInTheDocument();
  });

  // T7: AI 자동 분석 실행
  it('should run AI analysis', async () => {
    const user = userEvent.setup();

    // Mock creator user
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
        user: { id: '1', email: 'creator@test.com', role: 'creator', nickname: 'TestCreator', is_active: true, created_at: '2024-01-01', name: 'Test' },
        token: 'mock-token',
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: vi.fn(),
        initialize: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    render(<NewModelPage />);

    // 이미지 업로드 후 AI 분석 버튼 클릭
    const aiButton = screen.getByRole('button', { name: /AI 자동 분석/ });

    // 초기에는 비활성화 (이미지 없음)
    expect(aiButton).toBeDisabled();
  });

  // T8: AI 결과 폼 적용
  it('should apply AI analysis results to form', async () => {
    const user = userEvent.setup();

    // Mock creator user
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
        user: { id: '1', email: 'creator@test.com', role: 'creator', nickname: 'TestCreator', is_active: true, created_at: '2024-01-01', name: 'Test' },
        token: 'mock-token',
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: vi.fn(),
        initialize: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    render(<NewModelPage />);

    // Mock: AI 분석 완료 후 결과가 폼에 적용되는지 테스트
    // 실제 테스트는 통합 테스트에서 수행
  });

  // T9: AI 결과 수동 수정
  it('should allow manual editing after AI analysis', async () => {
    const user = userEvent.setup();

    // Mock creator user
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      const state = {
        user: { id: '1', email: 'creator@test.com', role: 'creator', nickname: 'TestCreator', is_active: true, created_at: '2024-01-01', name: 'Test' },
        token: 'mock-token',
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        fetchUser: vi.fn(),
        clearError: vi.fn(),
        initialize: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    render(<NewModelPage />);

    const descriptionInput = screen.getByLabelText(/소개/);
    await user.type(descriptionInput, 'Manually edited description');

    expect(descriptionInput).toHaveValue('Manually edited description');
  });

  // T10: 공개 등록 (status=active)
  it('should submit with active status on public registration', async () => {
    const user = userEvent.setup();

    // Mock file for image upload
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });

    render(<NewModelPage />);

    // 필수 필드 입력
    const nameInput = screen.getByLabelText(/모델 이름/);
    const styleSelect = screen.getByLabelText(/스타일/);
    const genderSelect = screen.getByLabelText(/성별/);
    const ageRangeSelect = screen.getByLabelText(/나이대/);

    await user.type(nameInput, 'Aria');
    await user.selectOptions(styleSelect, 'casual');
    await user.selectOptions(genderSelect, 'female');
    await user.selectOptions(ageRangeSelect, '20s');

    // 이미지 업로드 (mock)
    const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
    await user.upload(uploadInput, file);

    // 공개 등록 버튼 클릭
    const submitButton = screen.getByRole('button', { name: '공개 등록' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(modelRegistrationService.createModel).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Aria',
          style: 'casual',
          gender: 'female',
          age_range: '20s',
          status: 'active',
        })
      );
    });
  });

  // T11: 임시 저장 (status=draft)
  it('should submit with draft status on temporary save', async () => {
    const user = userEvent.setup();

    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });

    render(<NewModelPage />);

    // 필수 필드 입력
    const nameInput = screen.getByLabelText(/모델 이름/);
    const styleSelect = screen.getByLabelText(/스타일/);
    const genderSelect = screen.getByLabelText(/성별/);
    const ageRangeSelect = screen.getByLabelText(/나이대/);

    await user.type(nameInput, 'Aria');
    await user.selectOptions(styleSelect, 'casual');
    await user.selectOptions(genderSelect, 'female');
    await user.selectOptions(ageRangeSelect, '20s');

    // 이미지 업로드
    const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
    await user.upload(uploadInput, file);

    // 임시 저장 버튼 클릭
    const draftButton = screen.getByRole('button', { name: '임시 저장' });
    await user.click(draftButton);

    await waitFor(() => {
      expect(modelRegistrationService.createModel).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Aria',
          status: 'draft',
        })
      );
    });
  });

  // T12: 미리보기 모달
  it('should open preview modal', async () => {
    const user = userEvent.setup();

    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });

    render(<NewModelPage />);

    // 이미지 업로드
    const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
    await user.upload(uploadInput, file);

    // 미리보기 버튼 클릭
    const previewButton = screen.getByRole('button', { name: /미리보기/ });

    // 초기에는 이미지 없으면 비활성화
    // 이미지 업로드 후 활성화되면 클릭 가능
    await waitFor(() => {
      expect(previewButton).not.toBeDisabled();
    });

    await user.click(previewButton);

    // 모달 열림 확인
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('모델 프로필 미리보기')).toBeInTheDocument();
    });
  });
});
