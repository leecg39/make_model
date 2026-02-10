/**
 * Authentication API service.
 * Falls back to mock auth when backend is unavailable.
 */
import { authLib } from '@/lib/auth';
import type { AuthResponse, LoginRequest, RegisterRequest, User, PasswordChangeRequest } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Mock users for development when backend is unavailable
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: 'brand-1',
    email: 'brand@test.com',
    password: 'password123',
    name: '테스트 브랜드',
    nickname: 'TestBrand',
    role: 'brand',
    company_name: 'Test Company',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'creator-1',
    email: 'creator@test.com',
    password: 'password123',
    name: '테스트 크리에이터',
    nickname: 'TestCreator',
    role: 'creator',
    company_name: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

let mockRegisteredUsers: Array<User & { password: string }> = [];

async function isBackendAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authLib.getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    authLib.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  return response;
}

export const authService = {
  /**
   * Register a new user.
   */
  async register(data: RegisterRequest): Promise<User> {
    if (await isBackendAvailable()) {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      return response.json();
    }

    // Mock register fallback
    const allUsers = [...MOCK_USERS, ...mockRegisteredUsers];
    if (allUsers.some(u => u.email === data.email)) {
      throw new Error('이미 등록된 이메일입니다');
    }
    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.nickname,
      nickname: data.nickname,
      role: data.role,
      company_name: data.company_name || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    mockRegisteredUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  /**
   * Login and get access token.
   * Falls back to mock auth when backend is unavailable.
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (await isBackendAvailable()) {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const result = await response.json();
      if (result.access_token) {
        authLib.setToken(result.access_token);
      }
      return result;
    }

    // Mock login fallback
    const allUsers = [...MOCK_USERS, ...mockRegisteredUsers];
    const user = allUsers.find(u => u.email === data.email && u.password === data.password);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }
    const token = `mock-token-${user.id}-${Date.now()}`;
    authLib.setToken(token);
    // Store mock user for getCurrentUser
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_current_user', JSON.stringify(user));
    }
    return { access_token: token, token_type: 'bearer' };
  },

  /**
   * Logout current user.
   */
  async logout(): Promise<void> {
    try {
      if (await isBackendAvailable()) {
        await fetchWithAuth('/api/auth/logout', { method: 'POST' });
      }
    } finally {
      authLib.removeToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_current_user');
      }
    }
  },

  /**
   * Get current user profile.
   */
  async getCurrentUser(): Promise<User> {
    if (await isBackendAvailable()) {
      const response = await fetchWithAuth('/api/users/me');

      if (!response.ok) {
        throw new Error('Failed to get user');
      }

      return response.json();
    }

    // Mock getCurrentUser fallback
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mock_current_user');
      if (stored) {
        const { password: _, ...user } = JSON.parse(stored);
        return user;
      }
    }
    throw new Error('Not authenticated');
  },

  /**
   * Update current user profile.
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetchWithAuth('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Update failed');
    }

    return response.json();
  },

  /**
   * Change password.
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    const response = await fetchWithAuth('/api/auth/password/change', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Password change failed');
    }
  },

  /**
   * Social login (Google/Kakao).
   * Falls back to mock auth when backend is unavailable.
   */
  async socialLogin(provider: 'google' | 'kakao'): Promise<AuthResponse> {
    if (await isBackendAvailable()) {
      // Real OAuth flow: redirect to backend OAuth endpoint
      window.location.href = `${API_URL}/api/auth/${provider}`;
      // Won't reach here - browser redirects
      return { access_token: '', token_type: 'bearer' };
    }

    // Mock social login fallback
    const mockSocialUser: User & { password: string } = provider === 'google'
      ? {
          id: 'google-1',
          email: 'user@gmail.com',
          password: '',
          name: 'Google User',
          nickname: 'GoogleUser',
          role: 'brand',
          company_name: 'Google Inc.',
          is_active: true,
          created_at: new Date().toISOString(),
        }
      : {
          id: 'kakao-1',
          email: 'user@kakao.com',
          password: '',
          name: 'Kakao User',
          nickname: 'KakaoUser',
          role: 'creator',
          company_name: null,
          is_active: true,
          created_at: new Date().toISOString(),
        };

    const token = `mock-token-${mockSocialUser.id}-${Date.now()}`;
    authLib.setToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_current_user', JSON.stringify(mockSocialUser));
    }
    return { access_token: token, token_type: 'bearer' };
  },

  /**
   * Delete current user account.
   */
  async deleteAccount(): Promise<void> {
    const response = await fetchWithAuth('/api/users/me', {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete account');
    }

    authLib.removeToken();
  },
};

export default authService;
