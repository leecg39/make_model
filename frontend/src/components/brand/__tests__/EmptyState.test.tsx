// @TASK P4-S1-T1 - EmptyState 컴포넌트 테스트
// @SPEC specs/screens/brand-dashboard.yaml
// @TEST TDD RED phase

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders empty state message', () => {
    render(<EmptyState onExploreClick={vi.fn()} />);

    expect(screen.getByText('아직 주문 내역이 없습니다')).toBeInTheDocument();
  });

  it('renders explore CTA button', () => {
    render(<EmptyState onExploreClick={vi.fn()} />);

    expect(screen.getByText('AI 모델 찾아보기')).toBeInTheDocument();
  });

  it('calls onExploreClick when CTA is clicked', () => {
    const mockOnExploreClick = vi.fn();
    render(<EmptyState onExploreClick={mockOnExploreClick} />);

    const ctaButton = screen.getByText('AI 모델 찾아보기');
    fireEvent.click(ctaButton);

    expect(mockOnExploreClick).toHaveBeenCalled();
  });

  it('renders icon or illustration', () => {
    const { container } = render(<EmptyState onExploreClick={vi.fn()} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<EmptyState onExploreClick={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'AI 모델 찾아보기' });
    expect(button).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<EmptyState onExploreClick={vi.fn()} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });
});
