// @TASK P4-S4-T1 - MessageInput Component Test
// @SPEC specs/screens/order-chat.yaml

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '@/components/MessageInput';

describe('MessageInput', () => {
  it('renders textarea and send button', () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText(/메시지를 입력하세요/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /전송|send/i })).toBeInTheDocument();
  });

  it('calls onSend with message text when send button clicked', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    await user.type(textarea, 'Hello, this is a test message');

    const sendButton = screen.getByRole('button', { name: /전송|send/i });
    await user.click(sendButton);

    expect(onSend).toHaveBeenCalledWith({
      message: 'Hello, this is a test message',
      attachment: undefined,
    });
  });

  it('calls onSend with Enter key (without Shift)', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    await user.type(textarea, 'Quick message');
    await user.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith({
      message: 'Quick message',
      attachment: undefined,
    });
  });

  it('adds newline with Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i) as HTMLTextAreaElement;
    await user.type(textarea, 'Line 1');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await user.type(textarea, 'Line 2');

    expect(textarea.value).toContain('Line 1\nLine 2');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('clears input after sending', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i) as HTMLTextAreaElement;
    await user.type(textarea, 'Test message');
    await user.keyboard('{Enter}');

    expect(textarea.value).toBe('');
  });

  it('allows file attachment', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/파일 첨부|attach file/i) as HTMLInputElement;

    await user.upload(fileInput, file);

    expect(screen.getByText(/test.png/i)).toBeInTheDocument();
  });

  it('sends message with attachment', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const file = new File(['dummy content'], 'attachment.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/파일 첨부|attach file/i) as HTMLInputElement;

    await user.upload(fileInput, file);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    await user.type(textarea, 'See attached file');

    const sendButton = screen.getByRole('button', { name: /전송|send/i });
    await user.click(sendButton);

    expect(onSend).toHaveBeenCalledWith({
      message: 'See attached file',
      attachment: file,
    });
  });

  it('disables send button when message is empty', () => {
    render(<MessageInput onSend={vi.fn()} />);
    const sendButton = screen.getByRole('button', { name: /전송|send/i });
    expect(sendButton).toBeDisabled();
  });

  it('disables input while sending', () => {
    render(<MessageInput onSend={vi.fn()} isLoading={true} />);
    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    expect(textarea).toBeDisabled();
  });
});
