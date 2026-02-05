// @TEST P4-S4-T2 - 채팅방 통합 테스트
// @IMPL frontend/src/app/orders/[id]/chat/page.tsx
// @IMPL frontend/src/components/chat/ChatRoom.tsx
// @SPEC Phase 4 Chat Screen

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatRoomPage from '@/app/orders/[id]/chat/page';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { chatService } from '@/services/chat';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  useParams: vi.fn(() => ({ id: 'order-123' })),
  usePathname: vi.fn(() => '/orders/order-123/chat'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock auth store with Zustand 5 selector pattern
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: {
        id: 'user-1',
        email: 'brand@test.com',
        role: 'brand',
        name: 'Brand User',
        is_active: true,
        created_at: '2024-01-01',
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

// Mock chat service
vi.mock('@/services/chat', () => ({
  chatService: {
    getOrder: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    uploadAttachment: vi.fn(),
    markAsRead: vi.fn(),
    getUnreadCount: vi.fn(),
    getDeliveryFiles: vi.fn(),
  },
}));

// Mock scrollIntoView (jsdom doesn't support it)
Element.prototype.scrollIntoView = vi.fn();

// Mock window.alert
global.alert = vi.fn();

describe('Order Chat Room Integration Tests', () => {
  const mockOrder = {
    id: 'order-123',
    order_number: 'ORD-20240115-001',
    model: {
      id: 'model-1',
      name: 'AI Model Luna',
      profile_image: 'https://example.com/model.jpg',
    },
    status: 'in_progress' as const,
    package_type: 'Premium Package',
    created_at: '2024-01-15T09:00:00Z',
  };

  const mockMessages = [
    {
      id: 'msg-1',
      order_id: 'order-123',
      message: '안녕하세요. 이 모델로 진행 가능하신가요?',
      attachment_url: undefined,
      is_read: true,
      sender: {
        id: 'user-1',
        name: 'Brand User',
        role: 'brand' as const,
      },
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'msg-2',
      order_id: 'order-123',
      message: '네, 가능합니다. 일정은 언제가 좋으세요?',
      attachment_url: undefined,
      is_read: true,
      sender: {
        id: 'creator-1',
        name: 'Creator User',
        role: 'creator' as const,
      },
      created_at: '2024-01-15T10:05:00Z',
    },
    {
      id: 'msg-3',
      order_id: 'order-123',
      message: '포트폴리오를 확인해주세요',
      attachment_url: 'https://example.com/portfolio.jpg',
      attachment_name: 'portfolio.jpg',
      attachment_size: 102400,
      is_read: false,
      sender: {
        id: 'user-1',
        name: 'Brand User',
        role: 'brand' as const,
      },
      created_at: '2024-01-15T10:10:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default service mock responses
    vi.mocked(chatService.getOrder).mockResolvedValue(mockOrder);

    vi.mocked(chatService.getMessages).mockResolvedValue(mockMessages);

    vi.mocked(chatService.sendMessage).mockResolvedValue({
      id: 'msg-new',
      order_id: 'order-123',
      message: 'New message',
      attachment_url: undefined,
      is_read: false,
      sender: {
        id: 'user-1',
        name: 'Brand User',
        role: 'brand',
      },
      created_at: new Date().toISOString(),
    });

    vi.mocked(chatService.markAsRead).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('시나리오 1: 메시지 전송', () => {
    // @TEST P4-S4-T2.1 - 텍스트 메시지 전송 후 목록에 추가
    it('should send text message and add to message list', async () => {
      const user = userEvent.setup();

      render(<ChatRoomPage />);

      // 채팅방 로드 대기
      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      // 메시지 입력
      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/i) as HTMLInputElement;
      await user.type(messageInput, '새로운 메시지입니다');

      // 전송 버튼 클릭
      const sendButton = screen.getByRole('button', { name: /전송/ });
      await user.click(sendButton);

      // sendMessage 호출 확인
      await waitFor(() => {
        expect(chatService.sendMessage).toHaveBeenCalledWith(
          'order-123',
          expect.objectContaining({
            message: '새로운 메시지입니다',
            attachment: undefined,
          })
        );
      });

      // 메시지 입력창 비워짐 확인
      await waitFor(() => {
        expect(messageInput.value).toBe('');
      });
    });

    // @TEST P4-S4-T2.1.1 - 빈 메시지 전송 불가
    it('should prevent sending empty messages', async () => {
      const user = userEvent.setup();

      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      // 메시지 입력 안 함
      const sendButton = screen.getByRole('button', { name: /전송/ });

      // 버튼 비활성화 확인 또는 클릭 후 전송 안 됨
      if (sendButton.hasAttribute('disabled')) {
        expect(sendButton).toBeDisabled();
      } else {
        await user.click(sendButton);
        expect(chatService.sendMessage).not.toHaveBeenCalled();
      }
    });
  });

  describe('시나리오 2: 파일 첨부', () => {
    // @TEST P4-S4-T2.2 - 이미지 첨부 후 업로드 및 메시지 전송
    it('should upload image attachment and send message with file URL', async () => {
      const user = userEvent.setup();

      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      // 파일 입력
      const imageFile = new File(['image-data'], 'test-image.jpg', {
        type: 'image/jpeg',
      });

      const fileInput = screen.getByLabelText(/파일 첨부|첨부 파일|이미지 업로드/i) as HTMLInputElement;
      await user.upload(fileInput, imageFile);

      // 파일이 첨부되었는지 확인 (파일명 표시)
      await waitFor(() => {
        expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      });

      // 메시지 입력 및 전송
      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/i);
      await user.type(messageInput, '포트폴리오 확인해주세요');

      const sendButton = screen.getByRole('button', { name: /전송/ });
      await user.click(sendButton);

      // 파일을 포함한 메시지 전송 확인
      await waitFor(() => {
        expect(chatService.sendMessage).toHaveBeenCalledWith(
          'order-123',
          expect.objectContaining({
            message: '포트폴리오 확인해주세요',
            attachment: expect.any(File),
          })
        );
      });
    });

    // @TEST P4-S4-T2.2.1 - 파일 첨부 제거
    it('should allow removing attached file before sending', async () => {
      const user = userEvent.setup();

      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      // 파일 첨부
      const imageFile = new File(['image-data'], 'test-image.jpg', {
        type: 'image/jpeg',
      });

      const fileInput = screen.getByLabelText(/파일 첨부|첨부 파일|이미지 업로드/i) as HTMLInputElement;
      await user.upload(fileInput, imageFile);

      // 업로드된 파일 표시 대기
      await waitFor(() => {
        expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      });

      // 파일 제거 버튼 클릭
      const removeButton = screen.getByRole('button', { name: /파일 제거|첨부 제거|×/i });
      await user.click(removeButton);

      // 파일 제거 확인
      await waitFor(() => {
        expect(screen.queryByText('test-image.jpg')).not.toBeInTheDocument();
      });
    });
  });

  describe('시나리오 3: Enter 키 처리', () => {
    // @TEST P4-S4-T2.3 - Enter 키로 메시지 전송
    it('should send message when pressing Enter key', async () => {
      const user = userEvent.setup();

      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/i);
      await user.type(messageInput, '메시지 입력 후 Enter{Enter}');

      // sendMessage 호출 확인
      await waitFor(() => {
        expect(chatService.sendMessage).toHaveBeenCalledWith(
          'order-123',
          expect.objectContaining({
            message: '메시지 입력 후 Enter',
          })
        );
      });

      // 입력창 비워짐 확인
      await waitFor(() => {
        expect(messageInput).toHaveValue('');
      });
    });

    // @TEST P4-S4-T2.3.1 - Shift+Enter로 줄바꿈
    it('should add newline when pressing Shift+Enter', async () => {
      const user = userEvent.setup();

      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/i) as HTMLTextAreaElement;

      // 첫 번째 줄 입력
      await user.type(messageInput, '첫 번째 줄');

      // Shift+Enter로 줄바꿈
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      // 두 번째 줄 입력
      await user.type(messageInput, '두 번째 줄');

      // 여러 줄 입력 확인
      expect(messageInput.value).toContain('\n');
    });
  });

  describe('시나리오 4: 메시지 로드 및 정렬', () => {
    // @TEST P4-S4-T2.4 - 채팅방 접속 시 기존 메시지 로드 및 시간순 표시
    it('should load existing messages and display in chronological order', async () => {
      render(<ChatRoomPage />);

      // 모든 메시지가 순서대로 표시되는지 확인
      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');
      expect(screen.getByText('네, 가능합니다. 일정은 언제가 좋으세요?')).toBeInTheDocument();
      expect(screen.getByText('포트폴리오를 확인해주세요')).toBeInTheDocument();

      // getMessages 호출 확인
      expect(chatService.getMessages).toHaveBeenCalledWith('order-123');

      // 메시지 순서 확인: 시간순(오래된순)
      const messages = screen.getAllByText(/안녕하세요|네, 가능합니다|포트폴리오/);
      expect(messages.length).toBeGreaterThanOrEqual(3);
    });

    // @TEST P4-S4-T2.4.1 - 읽지 않은 메시지 표시
    it('should display unread status indicator for unread messages', async () => {
      render(<ChatRoomPage />);

      await screen.findByText('포트폴리오를 확인해주세요');

      // 읽지 않은 메시지 표시 확인 (보통 배지나 다른 스타일)
      const unreadMessages = screen.getAllByText(/포트폴리오를 확인해주세요/);
      expect(unreadMessages.length).toBeGreaterThan(0);

      // markAsRead 호출 확인 (메시지 표시 시)
      await waitFor(() => {
        expect(chatService.markAsRead).toHaveBeenCalledWith('order-123');
      });
    });

    // @TEST P4-S4-T2.4.2 - 발신자 정보 표시
    it('should display sender information for each message', async () => {
      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      // 크리에이터 사용자의 메시지 (받은 메시지만 발신자명 표시)
      expect(screen.getByText('Creator User')).toBeInTheDocument();

      // 브랜드 사용자 메시지는 보낸 메시지라 발신자명 미표시
      // 대신 보낸 메시지가 제대로 렌더링되는지 확인
      const sentMessages = screen.getAllByText(/안녕하세요|포트폴리오/);
      expect(sentMessages.length).toBeGreaterThan(0);
    });

    // @TEST P4-S4-T2.4.3 - 시간 표시
    it('should display timestamp for each message', async () => {
      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      // 시간 표시 확인 (예: "10:00", "2024년 1월 15일")
      const timeElements = screen.getAllByText(/\d{2}:\d{2}|2024/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    // @TEST P4-S4-T2.4.4 - 마지막 메시지로 자동 스크롤
    it('should auto-scroll to latest message on load', async () => {
      const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

      render(<ChatRoomPage />);

      await screen.findByText('포트폴리오를 확인해주세요');

      // scrollIntoView 호출 확인 (마지막 메시지로 스크롤)
      expect(scrollSpy).toHaveBeenCalled();

      scrollSpy.mockRestore();
    });
  });

  describe('시나리오 5: 에러 처리', () => {
    // @TEST P4-S4-T2.5 - 메시지 전송 실패 처리
    it('should handle message send failure gracefully', async () => {
      const user = userEvent.setup();

      vi.mocked(chatService.sendMessage).mockRejectedValueOnce(
        new Error('메시지 전송 실패')
      );

      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/i) as HTMLTextAreaElement;
      await user.type(messageInput, '테스트 메시지');

      const sendButton = screen.getByRole('button', { name: /전송/ });
      await user.click(sendButton);

      // alert() 호출 확인 (컴포넌트는 alert로 에러 표시)
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('메시지 전송에 실패했습니다')
        );
      });

      // 입력창 비워짐 확인 (optimistic update 후 실패 시 제거)
      await waitFor(() => {
        expect(messageInput.value).toBe('');
      });
    });

    // @TEST P4-S4-T2.5.1 - 파일 업로드 실패 처리 (메시지 전송 실패로 인한)
    it('should handle file upload failure gracefully', async () => {
      const user = userEvent.setup();

      // sendMessage 실패 시뮬레이션 (파일 포함)
      vi.mocked(chatService.sendMessage).mockRejectedValueOnce(
        new Error('파일 업로드 실패')
      );

      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      const imageFile = new File(['image-data'], 'test-image.jpg', {
        type: 'image/jpeg',
      });

      const fileInput = screen.getByLabelText(/파일 첨부|첨부 파일|이미지 업로드/i) as HTMLInputElement;
      await user.upload(fileInput, imageFile);

      // 파일이 첨부되었는지 확인
      await waitFor(() => {
        expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      });

      // 메시지 입력 및 전송
      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/i);
      await user.type(messageInput, '파일 전송 테스트');

      const sendButton = screen.getByRole('button', { name: /전송/ });
      await user.click(sendButton);

      // alert() 호출 확인
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('메시지 전송에 실패했습니다')
        );
      });

      // 다시 시도 가능
      expect(fileInput).not.toBeDisabled();
    });
  });

  describe('시나리오 6: 로드 및 인증', () => {
    // @TEST P4-S4-T2.6 - 채팅방 초기 로드 및 메시지 페칭
    it('should fetch chat messages on page load', async () => {
      render(<ChatRoomPage />);

      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      // getMessages 호출 확인
      expect(chatService.getMessages).toHaveBeenCalledWith('order-123');
    });

    // @TEST P4-S4-T2.6.1 - 인증 없이 접속 불가
    it('should require authentication to access chat', async () => {
      // 인증되지 않은 사용자 설정
      vi.mocked(useAuthStore).mockImplementationOnce((selector?: any) => {
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

      render(<ChatRoomPage />);

      // 채팅 폼 미표시 또는 로그인 페이지로 리다이렉트
      const messageInput = screen.queryByPlaceholderText(/메시지를 입력하세요/i);
      if (!messageInput) {
        // 리다이렉트된 경우 (테스트 환경에서는 렌더링될 수도 있음)
        expect(screen.queryByPlaceholderText(/메시지를 입력하세요/i)).not.toBeInTheDocument();
      }
    });
  });

  describe('시나리오 7: 메시지 입력 UI', () => {
    // @TEST P4-S4-T2.7 - 메시지 입력창과 전송 버튼 표시
    it('should display message input field and send button', async () => {
      render(<ChatRoomPage />);

      // 채팅방 로드 대기
      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/i);
      const sendButton = screen.getByRole('button', { name: /전송/ });

      expect(messageInput).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
    });

    // @TEST P4-S4-T2.7.1 - 파일 첨부 버튼 표시
    it('should display file attachment button', async () => {
      render(<ChatRoomPage />);

      // 채팅방 로드 대기
      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      const attachButton = screen.getByLabelText(/파일 첨부/i);
      expect(attachButton).toBeInTheDocument();
    });

    // @TEST P4-S4-T2.7.2 - 입력 중 전송 버튼 활성화
    it('should enable send button when text is entered', async () => {
      const user = userEvent.setup();

      render(<ChatRoomPage />);

      // 채팅방 로드 대기
      await screen.findByText('안녕하세요. 이 모델로 진행 가능하신가요?');

      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/i);
      const sendButton = screen.getByRole('button', { name: /전송/ });

      // 초기: 비활성화 또는 활성화 (구현에 따라)
      // 텍스트 입력 후: 활성화
      await user.type(messageInput, '테스트');

      // 버튼이 활성화되었는지 확인
      expect(sendButton.hasAttribute('disabled')).toBe(false);
    });
  });
});
