// @TASK P4-S2-T1 - UploadModal component test
// @SPEC specs/screens/creator-dashboard.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadModal } from './UploadModal';

describe('UploadModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <UploadModal
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
      <UploadModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('작업물 업로드')).toBeInTheDocument();
    expect(screen.getByText('파일 선택')).toBeInTheDocument();
  });

  it('allows file selection', async () => {
    const user = userEvent.setup();
    render(
      <UploadModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/파일 선택/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(input.files?.[0]?.name).toBe('image.jpg');
    });
  });

  it('requires at least one file before upload', async () => {
    const user = userEvent.setup();
    render(
      <UploadModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const uploadButton = screen.getByText('업로드');
    await user.click(uploadButton);

    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('최소 1개의 파일을 선택해주세요')).toBeInTheDocument();
  });

  it('calls onConfirm with file data when upload clicked', async () => {
    const user = userEvent.setup();
    render(
      <UploadModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/파일 선택/i) as HTMLInputElement;

    await user.upload(input, file);

    const notesTextarea = screen.getByPlaceholderText('전달 사항 (선택)');
    await user.type(notesTextarea, '작업 완료했습니다');

    const uploadButton = screen.getByText('업로드');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('1', expect.any(Array), '작업 완료했습니다');
    });
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(
      <UploadModal
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

  it('shows upload progress', async () => {
    const user = userEvent.setup();
    mockOnConfirm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <UploadModal
        isOpen={true}
        orderId="1"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/파일 선택/i) as HTMLInputElement;

    await user.upload(input, file);

    const uploadButton = screen.getByText('업로드');
    await user.click(uploadButton);

    expect(screen.getByText('업로드 중...')).toBeInTheDocument();
  });
});
