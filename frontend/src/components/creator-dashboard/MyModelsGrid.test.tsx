// @TASK P4-S2-T1 - MyModelsGrid component test
// @SPEC specs/screens/creator-dashboard.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyModelsGrid } from './MyModelsGrid';
import type { AIModel } from '@/types/model';

const mockModels: AIModel[] = [
  {
    id: '1',
    creator_id: 'creator1',
    name: 'Fashion Model A',
    description: 'Modern style',
    style: 'casual',
    gender: 'female',
    age_range: '20s',
    view_count: 1500,
    rating: 4.5,
    status: 'published',
    thumbnail_url: 'https://example.com/model1.jpg',
    tags: ['fashion', 'casual'],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    creator_id: 'creator1',
    name: 'Fashion Model B',
    description: 'Elegant style',
    style: 'formal',
    gender: 'male',
    age_range: '30s',
    view_count: 800,
    rating: 4.2,
    status: 'active',
    thumbnail_url: 'https://example.com/model2.jpg',
    tags: ['fashion', 'formal'],
    created_at: '2024-01-15T00:00:00Z',
  },
];

const mockPush = vi.fn();
const mockUseRouter = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}));

describe('MyModelsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  it('renders empty state when no models', () => {
    render(<MyModelsGrid models={[]} isLoading={false} />);

    expect(screen.getByText('등록된 모델이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 모델 등록하기')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<MyModelsGrid models={[]} isLoading={true} />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('renders model cards with correct data', () => {
    render(<MyModelsGrid models={mockModels} isLoading={false} />);

    expect(screen.getByText('Fashion Model A')).toBeInTheDocument();
    expect(screen.getByText('Fashion Model B')).toBeInTheDocument();
    expect(screen.getByText('조회수: 1,500')).toBeInTheDocument();
    expect(screen.getByText('평점: 4.5')).toBeInTheDocument();
  });

  it('navigates to model detail on card click', async () => {
    const user = userEvent.setup();
    render(<MyModelsGrid models={mockModels} isLoading={false} />);

    const modelCard = screen.getByText('Fashion Model A').closest('div[role="button"]');
    if (modelCard) {
      await user.click(modelCard);
      expect(mockPush).toHaveBeenCalledWith('/models/1');
    }
  });

  it('navigates to model registration on CTA click', async () => {
    const user = userEvent.setup();
    render(<MyModelsGrid models={[]} isLoading={false} />);

    await user.click(screen.getByText('첫 번째 모델 등록하기'));
    expect(mockPush).toHaveBeenCalledWith('/models/new');
  });

  it('displays model status badge', () => {
    render(<MyModelsGrid models={mockModels} isLoading={false} />);

    expect(screen.getByText('공개')).toBeInTheDocument();
    expect(screen.getByText('활성')).toBeInTheDocument();
  });
});
