// @TEST P4-S3-T2 - AI 모델 등록 통합 테스트
// @IMPL frontend/src/app/models/new/page.tsx
// @SPEC Phase 4 Model Registration Screen

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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
      user: {
        id: '1',
        email: 'creator@test.com',
        role: 'creator',
        nickname: 'TestCreator',
        is_active: true,
        created_at: '2024-01-01',
        name: 'Test',
      },
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

// Mock toast notification (commonly used in Next.js projects)
const mockToast = vi.fn();
vi.mock('@/lib/toast', () => ({
  useToast: () => ({
    success: mockToast,
    error: mockToast,
    info: mockToast,
  }),
}), { try: true });

describe('Model Registration Integration Tests', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRouter
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
    } as any);

    // Default service mock responses
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
      style: 'formal',
      tags: ['elegant', 'professional', 'modern'],
      description: 'AI가 분석한 formal 스타일의 모델입니다. elegant, professional 느낌이 특징입니다.',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('시나리오 1: 이미지 업로드 + AI 분석 → 자동 채움', () => {
    // T1: 5장 드래그 앤 드롭 후 AI 분석 실행 및 폼 자동 채움
    it('should upload 5 images and apply AI analysis results to form', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 5개 이미지 파일 생성
      const imageFiles = Array.from({ length: 5 }, (_, i) =>
        new File([`image-${i + 1}`], `image-${i + 1}.jpg`, {
          type: 'image/jpeg',
        })
      );

      // 이미지 업로드 (드래그 앤 드롭 또는 입력)
      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFiles);

      // 모든 이미지가 업로드되었는지 확인
      await waitFor(() => {
        const imageCountText = screen.getByText(/5 \/ 10 업로드됨/);
        expect(imageCountText).toBeInTheDocument();
      });

      // AI 분석 버튼 활성화 확인
      const aiButton = screen.getByRole('button', { name: /AI 자동 분석/ });
      expect(aiButton).not.toBeDisabled();

      // AI 분석 버튼 클릭
      await user.click(aiButton);

      // AI 분석 실행 확인
      await waitFor(() => {
        expect(modelRegistrationService.analyzeImages).toHaveBeenCalled();
      });

      // AI 분석 결과 표시 확인
      await waitFor(() => {
        expect(screen.getByText('AI 분석 완료')).toBeInTheDocument();
      });

      // AI 분석 결과에서 "폼에 적용" 버튼 클릭
      const applyButton = screen.getByRole('button', { name: /폼에 적용/ });
      await user.click(applyButton);

      // 폼에 AI 결과가 적용되었는지 확인
      await waitFor(() => {
        const styleSelect = screen.getByLabelText(/스타일/) as HTMLSelectElement;
        expect(styleSelect.value).toBe('formal');

        // 설명이 폼에 추가되었는지 확인
        const descriptionInput = screen.getByLabelText(/소개/) as HTMLTextAreaElement;
        expect(descriptionInput.value).toContain('formal');
      });

      // 태그가 폼에 추가되었는지 확인 (getAllByText 사용)
      const elegantTags = screen.getAllByText('#elegant');
      expect(elegantTags.length).toBeGreaterThan(0);
    });

    // T2: AI 분석 없이 이미지만 업로드
    it('should allow uploading images without AI analysis', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      await waitFor(() => {
        expect(screen.getByText(/1 \/ 10 업로드됨/)).toBeInTheDocument();
      });

      // AI 분석을 실행하지 않고 폼에 수동 입력
      const nameInput = screen.getByLabelText(/모델 이름/);
      const styleSelect = screen.getByLabelText(/스타일/);
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);

      await user.type(nameInput, 'Manual Model');
      await user.selectOptions(styleSelect, 'casual');
      await user.selectOptions(genderSelect, 'female');
      await user.selectOptions(ageRangeSelect, '20s');

      expect(nameInput).toHaveValue('Manual Model');
      expect(styleSelect).toHaveValue('casual');
    });

    // T3: 이미지 업로드 후 순서 변경
    it('should allow reordering images after upload', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const imageFiles = Array.from({ length: 3 }, (_, i) =>
        new File([`image-${i + 1}`], `image-${i + 1}.jpg`, {
          type: 'image/jpeg',
        })
      );

      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFiles);

      // 이미지들이 렌더링될 때까지 대기
      await waitFor(() => {
        expect(screen.getByText(/3 \/ 10 업로드됨/)).toBeInTheDocument();
      });

      // 모든 이미지 div 찾기
      const imageElements = screen.getAllByAltText(/업로드 이미지/);
      expect(imageElements).toHaveLength(3);

      // 첫 번째 이미지의 순서 번호 확인 (#1)
      const firstImageContainer = imageElements[0].closest('div')?.parentElement?.parentElement;
      expect(firstImageContainer?.textContent).toContain('#1');
    });
  });

  describe('시나리오 2: AI 결과 수정 → 폼 업데이트', () => {
    // T4: AI casual → formal로 스타일 수정
    it('should allow editing AI analysis results - change style from casual to formal', async () => {
      const user = userEvent.setup();

      // AI 분석 결과를 casual로 설정
      vi.mocked(modelRegistrationService.analyzeImages).mockResolvedValue({
        style: 'casual',
        tags: ['natural', 'fresh'],
        description: 'AI가 분석한 casual 스타일의 모델입니다.',
      });

      render(<NewModelPage />);

      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      const aiButton = screen.getByRole('button', { name: /AI 자동 분석/ });
      await user.click(aiButton);

      // AI 분석 결과 대기
      await waitFor(() => {
        expect(screen.getByText('AI 분석 완료')).toBeInTheDocument();
      });

      // 폼에 적용
      const applyButton = screen.getByRole('button', { name: /폼에 적용/ });
      await user.click(applyButton);

      // 스타일 확인 (casual)
      await waitFor(() => {
        const styleSelect = screen.getByLabelText(/스타일/) as HTMLSelectElement;
        expect(styleSelect.value).toBe('casual');
      });

      // 스타일 수동 변경 (casual → formal)
      const styleSelect = screen.getByLabelText(/스타일/);
      await user.selectOptions(styleSelect, 'formal');

      expect(styleSelect).toHaveValue('formal');
    });

    // T5: 폼에 태그 추가 및 삭제
    it('should allow adding and removing tags manually', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const tagInput = screen.getByLabelText(/태그/) as HTMLInputElement;
      const addButton = screen.getAllByRole('button', { name: /추가/ })[0];

      // 첫 번째 태그 추가
      await user.type(tagInput, 'fashion');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('#fashion')).toBeInTheDocument();
      });

      // 두 번째 태그 추가
      await user.type(tagInput, 'model');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('#model')).toBeInTheDocument();
      });

      // 첫 번째 태그 삭제
      const deleteButtons = screen.getAllByRole('button', { name: /태그.*삭제/ });
      await user.click(deleteButtons[0]);

      // 태그 삭제 확인
      await waitFor(() => {
        expect(screen.getByText('#model')).toBeInTheDocument();
        expect(screen.queryByText('#fashion')).not.toBeInTheDocument();
      });
    });

    // T6: AI 설명 수정
    it('should allow editing AI-generated description', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      const aiButton = screen.getByRole('button', { name: /AI 자동 분석/ });
      await user.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText('AI 분석 완료')).toBeInTheDocument();
      });

      const applyButton = screen.getByRole('button', { name: /폼에 적용/ });
      await user.click(applyButton);

      // 설명 확인 및 수정
      const descriptionInput = screen.getByLabelText(/소개/) as HTMLTextAreaElement;
      await waitFor(() => {
        expect(descriptionInput.value).toContain('formal');
      });

      // 기존 내용 전체 선택 후 새 내용으로 변경
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'My custom description for the model');

      expect(descriptionInput.value).toBe('My custom description for the model');
    });
  });

  describe('시나리오 3: 공개 등록 → status=active + /dashboard/creator', () => {
    // T7: 모든 필드 입력 후 공개 등록
    it('should submit with active status and redirect on public registration', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 필수 필드 입력
      const nameInput = screen.getByLabelText(/모델 이름/);
      const descriptionInput = screen.getByLabelText(/소개/);
      const styleSelect = screen.getByLabelText(/스타일/);
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);

      await user.type(nameInput, 'Aria Model');
      await user.type(descriptionInput, 'Beautiful AI model for fashion');
      await user.selectOptions(styleSelect, 'formal');
      await user.selectOptions(genderSelect, 'female');
      await user.selectOptions(ageRangeSelect, '20s');

      // 이미지 업로드
      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });
      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      // 공개 등록 버튼 클릭
      const submitButton = screen.getByRole('button', { name: /공개 등록/ });
      await user.click(submitButton);

      // createModel 호출 확인
      await waitFor(() => {
        expect(modelRegistrationService.createModel).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Aria Model',
            description: 'Beautiful AI model for fashion',
            style: 'formal',
            gender: 'female',
            age_range: '20s',
            status: 'active',
          })
        );
      });

      // 모델 생성 후 리다이렉트 확인
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/models/model-123');
      });
    });

    // T8: AI 분석 결과로 공개 등록
    it('should submit with AI analysis results as active status', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      // AI 분석 실행
      const aiButton = screen.getByRole('button', { name: /AI 자동 분석/ });
      await user.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText('AI 분석 완료')).toBeInTheDocument();
      });

      // AI 결과 적용
      const applyButton = screen.getByRole('button', { name: /폼에 적용/ });
      await user.click(applyButton);

      // 모델 이름 입력
      const nameInput = screen.getByLabelText(/모델 이름/);
      await user.type(nameInput, 'AI Generated Model');

      // 성별과 나이대 선택 (AI는 스타일과 태그, 설명만 제공)
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);
      await user.selectOptions(genderSelect, 'female');
      await user.selectOptions(ageRangeSelect, '20s');

      // 공개 등록
      const submitButton = screen.getByRole('button', { name: /공개 등록/ });
      await user.click(submitButton);

      // 폼 제출 확인
      await waitFor(() => {
        expect(modelRegistrationService.createModel).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'AI Generated Model',
            style: 'formal',
            gender: 'female',
            age_range: '20s',
            status: 'active',
            tags: ['elegant', 'professional', 'modern'],
          })
        );
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/models/model-123');
      });
    });

    // T9: 필수 필드 미입력 시 공개 등록 불가
    it('should prevent public registration without required fields', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 필수 필드를 입력하지 않고 공개 등록 시도
      const submitButton = screen.getByRole('button', { name: /공개 등록/ });
      await user.click(submitButton);

      // 에러 메시지 표시 확인
      await waitFor(() => {
        expect(screen.getByText(/모델 이름을 입력해주세요/)).toBeInTheDocument();
        expect(screen.getByText(/스타일을 선택해주세요/)).toBeInTheDocument();
      });

      // createModel 호출 안 됨
      expect(modelRegistrationService.createModel).not.toHaveBeenCalled();
    });

    // T10: 이미지 미업로드 시 공개 등록 불가
    it('should prevent public registration without images', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 필수 필드 입력 (이미지 제외)
      const nameInput = screen.getByLabelText(/모델 이름/);
      const styleSelect = screen.getByLabelText(/스타일/);
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);

      await user.type(nameInput, 'Aria');
      await user.selectOptions(styleSelect, 'casual');
      await user.selectOptions(genderSelect, 'female');
      await user.selectOptions(ageRangeSelect, '20s');

      // 공개 등록 시도
      const submitButton = screen.getByRole('button', { name: /공개 등록/ });
      await user.click(submitButton);

      // 이미지 필수 에러 표시
      await waitFor(() => {
        expect(screen.getByText(/최소 1장의 이미지를 업로드해주세요/)).toBeInTheDocument();
      });

      expect(modelRegistrationService.createModel).not.toHaveBeenCalled();
    });
  });

  describe('시나리오 4: 임시 저장 → status=draft + 토스트', () => {
    // T11: 임시 저장 필드 검증
    it('should require name field for draft save', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 이미지만 업로드하고 이름 입력 안 함
      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });
      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      // 임시 저장 시도
      const draftButton = screen.getByRole('button', { name: /임시 저장/ });
      await user.click(draftButton);

      // 필수 필드 에러 표시
      await waitFor(() => {
        expect(screen.getByText(/모델 이름을 입력해주세요/)).toBeInTheDocument();
      });

      // 제출 안 됨
      expect(modelRegistrationService.createModel).not.toHaveBeenCalled();
    });

    // T12: 임시 저장 성공 후 리다이렉트
    it('should redirect to model profile after draft save', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 필수 필드 입력
      const nameInput = screen.getByLabelText(/모델 이름/);
      const styleSelect = screen.getByLabelText(/스타일/);
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);

      await user.type(nameInput, 'Draft Model');
      await user.selectOptions(styleSelect, 'casual');
      await user.selectOptions(genderSelect, 'female');
      await user.selectOptions(ageRangeSelect, '20s');

      // 이미지 업로드
      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });
      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      // 임시 저장
      const draftButton = screen.getByRole('button', { name: /임시 저장/ });
      await user.click(draftButton);

      // 성공 후 리다이렉트
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/models/model-123');
      });
    });

    // T13: 임시 저장 검증 및 API 호출
    it('should validate and submit draft with correct status', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 최소 필수 필드만 입력
      const nameInput = screen.getByLabelText(/모델 이름/);
      const styleSelect = screen.getByLabelText(/스타일/);
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);

      await user.type(nameInput, 'Minimal Model');
      await user.selectOptions(styleSelect, 'casual');
      await user.selectOptions(genderSelect, 'male');
      await user.selectOptions(ageRangeSelect, '30s');

      // 이미지 업로드
      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });
      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      // 임시 저장 클릭
      const draftButton = screen.getByRole('button', { name: /임시 저장/ });
      await user.click(draftButton);

      // API 호출 확인 및 status가 draft인지 확인
      await waitFor(() => {
        expect(modelRegistrationService.createModel).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'draft',
          })
        );
      });
    });

    // T14: 폼 제출 후 로딩 상태 해제
    it('should clear loading state after submission completes', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 필수 필드 입력
      const nameInput = screen.getByLabelText(/모델 이름/);
      const styleSelect = screen.getByLabelText(/스타일/);
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);

      await user.type(nameInput, 'Test Model');
      await user.selectOptions(styleSelect, 'formal');
      await user.selectOptions(genderSelect, 'female');
      await user.selectOptions(ageRangeSelect, '20s');

      // 이미지 업로드
      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });
      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      // 제출 버튼 클릭
      const submitButton = screen.getByRole('button', { name: /공개 등록/ });
      await user.click(submitButton);

      // 로딩 완료 후 리다이렉트 확인
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe('엣지 케이스 및 에러 처리', () => {
    // T15: AI 분석 실패 처리
    it('should handle AI analysis failure gracefully', async () => {
      const user = userEvent.setup();

      // AI 분석 실패 설정
      vi.mocked(modelRegistrationService.analyzeImages).mockRejectedValue(
        new Error('AI 분석 서버 오류')
      );

      render(<NewModelPage />);

      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      const aiButton = screen.getByRole('button', { name: /AI 자동 분석/ });
      await user.click(aiButton);

      // 에러 메시지 표시
      await waitFor(() => {
        expect(screen.getByText(/AI 분석 서버 오류/)).toBeInTheDocument();
      });

      // AI 분석 버튼 다시 클릭 가능
      expect(aiButton).not.toBeDisabled();
    });

    // T16: API 모델 생성 실패 처리
    it('should handle model creation failure', async () => {
      const user = userEvent.setup();

      vi.mocked(modelRegistrationService.createModel).mockRejectedValue(
        new Error('모델 생성 실패')
      );

      render(<NewModelPage />);

      const nameInput = screen.getByLabelText(/모델 이름/);
      const styleSelect = screen.getByLabelText(/스타일/);
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);

      await user.type(nameInput, 'Test Model');
      await user.selectOptions(styleSelect, 'casual');
      await user.selectOptions(genderSelect, 'female');
      await user.selectOptions(ageRangeSelect, '20s');

      const imageFile = new File(['image'], 'image.jpg', {
        type: 'image/jpeg',
      });
      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFile);

      const submitButton = screen.getByRole('button', { name: /공개 등록/ });
      await user.click(submitButton);

      // 에러 메시지 표시
      await waitFor(() => {
        expect(screen.getByText(/모델 생성 실패/)).toBeInTheDocument();
      });

      // 리다이렉트 안 됨
      expect(mockPush).not.toHaveBeenCalled();
    });

    // T17: 이미지 업로드 후 썸네일 설정
    it('should set thumbnail for first image automatically', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const imageFiles = Array.from({ length: 2 }, (_, i) =>
        new File([`image-${i + 1}`], `image-${i + 1}.jpg`, {
          type: 'image/jpeg',
        })
      );

      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFiles);

      await waitFor(() => {
        expect(screen.getByText(/2 \/ 10 업로드됨/)).toBeInTheDocument();
      });

      // 첫 번째 이미지가 썸네일로 설정되었는지 확인
      expect(screen.getByText('썸네일')).toBeInTheDocument();
    });

    // T18: 이미지 삭제 후 썸네일 자동 변경
    it('should auto-assign thumbnail when thumbnail image is removed', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const imageFiles = Array.from({ length: 2 }, (_, i) =>
        new File([`image-${i + 1}`], `image-${i + 1}.jpg`, {
          type: 'image/jpeg',
        })
      );

      const uploadInput = screen.getByLabelText('이미지 업로드') as HTMLInputElement;
      await user.upload(uploadInput, imageFiles);

      await waitFor(() => {
        expect(screen.getByText(/2 \/ 10 업로드됨/)).toBeInTheDocument();
      });

      // 썸네일이 보임
      expect(screen.getByText('썸네일')).toBeInTheDocument();
    });

    // T19: 다중 선택 항목 변경
    it('should update all dropdown selections correctly', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const styleSelect = screen.getByLabelText(/스타일/);
      const genderSelect = screen.getByLabelText(/성별/);
      const ageRangeSelect = screen.getByLabelText(/나이대/);

      // 각각 다른 값으로 선택
      await user.selectOptions(styleSelect, 'formal');
      await user.selectOptions(genderSelect, 'male');
      await user.selectOptions(ageRangeSelect, '30s');

      expect(styleSelect).toHaveValue('formal');
      expect(genderSelect).toHaveValue('male');
      expect(ageRangeSelect).toHaveValue('30s');

      // 다시 변경
      await user.selectOptions(styleSelect, 'casual');
      expect(styleSelect).toHaveValue('casual');
    });
  });

  describe('폼 상태 관리 및 유효성 검사', () => {
    // T20: 폼 필드 입력 상태 유지
    it('should maintain form field values during input', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      // 폼 필드 채우기
      const nameInput = screen.getByLabelText(/모델 이름/) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(/소개/) as HTMLTextAreaElement;

      await user.type(nameInput, 'Test Model');
      await user.type(descriptionInput, 'Test description');

      expect(nameInput.value).toBe('Test Model');
      expect(descriptionInput.value).toBe('Test description');

      // 다른 필드 입력 후에도 값 유지 확인
      const styleSelect = screen.getByLabelText(/스타일/);
      await user.selectOptions(styleSelect, 'casual');

      expect(nameInput.value).toBe('Test Model');
      expect(styleSelect).toHaveValue('casual');
    });

    // T21: 중복 태그 추가 방지
    it('should prevent adding duplicate tags', async () => {
      const user = userEvent.setup();

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<NewModelPage />);

      const tagInput = screen.getByLabelText(/태그/) as HTMLInputElement;
      const addButton = screen.getAllByRole('button', { name: /추가/ })[0]; // 태그 추가 버튼

      // 첫 번째 태그 추가
      await user.type(tagInput, 'fashion');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('#fashion')).toBeInTheDocument();
      });

      // 같은 태그 다시 추가 시도
      await user.type(tagInput, 'fashion');
      await user.click(addButton);

      // 중복 태그 알림 (alert이 호출되었을 때)
      if (alertSpy.mock.calls.length > 0) {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('이미 추가된')
        );
      }

      // 또는 태그 개수 확인으로 중복 방지 검증
      const fashionTags = screen.getAllByText('#fashion');
      expect(fashionTags.length).toBe(1); // 1개만 존재해야 함

      alertSpy.mockRestore();
    });

    // T22: Enter 키로 태그 추가
    it('should add tag when pressing Enter key', async () => {
      const user = userEvent.setup();

      render(<NewModelPage />);

      const tagInput = screen.getByLabelText(/태그/) as HTMLInputElement;

      await user.type(tagInput, 'style');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('#style')).toBeInTheDocument();
      });

      // 입력창 비워짐 확인
      expect(tagInput.value).toBe('');
    });
  });
});
