// @TASK P4-S2-T1 - RejectModal component test
// @SPEC specs/screens/creator-dashboard.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RejectModal } from './RejectModal';

describe('RejectModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <RejectModal
        isOpen={false}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <RejectModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('주문 거절')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('거절 사유를 입력해주세요')).toBeInTheDocument();
  });

  it('requires rejection reason input', async () => {
    const user = userEvent.setup();
    render(
      <RejectModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('거절하기');
    await user.click(confirmButton);

    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('거절 사유를 입력해주세요')).toBeInTheDocument();
  });

  it('calls onConfirm with reason when confirmed', async () => {
    const user = userEvent.setup();
    render(
      <RejectModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText('거절 사유를 입력해주세요');
    await user.type(textarea, '일정이 맞지 않습니다');

    const confirmButton = screen.getByText('거절하기');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith('1', '일정이 맞지 않습니다');
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(
      <RejectModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onCancel when clicking outside modal', async () => {
    const user = userEvent.setup();
    render(
      <RejectModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });
});
