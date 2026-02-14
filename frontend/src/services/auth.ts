/**
 * Authentication API service.
 * Falls back to mock auth when backend is unavailable.
 */
import { authLib } from '@/lib/auth';
import { isMockAuthMode } from '@/lib/auth-mode';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResult,
  User,
  PasswordChangeRequest,
} from '@/types/auth';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

const mockRegisteredUsers: Array<User & { password: string }> = [];

function isNetworkFetchError(error: unknown): boolean {
  if (!(error instanceof TypeError)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('load failed')
  );
}

function registerWithMock(data: RegisterRequest): RegisterResult {
  const allUsers = [...MOCK_USERS, ...mockRegisteredUsers];
  if (allUsers.some((user) => user.email === data.email)) {
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

  const { password: _password, ...userWithoutPassword } = newUser;
  return {
    user: userWithoutPassword,
    requiresEmailVerification: false,
  };
}

function loginWithMock(data: LoginRequest): AuthResponse {
  const allUsers = [...MOCK_USERS, ...mockRegisteredUsers];
  const user = allUsers.find((candidate) => candidate.email === data.email && candidate.password === data.password);
  if (!user) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  const token = `mock-token-${user.id}-${Date.now()}`;
  authLib.setToken(token);
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_current_user', JSON.stringify(user));
  }

  return { access_token: token, token_type: 'bearer' };
}

function getStoredMockUser(): (User & { password?: string }) | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem('mock_current_user');
  if (!stored) {
    return null;
  }

  return JSON.parse(stored) as User & { password?: string };
}

function setStoredMockUser(user: User & { password?: string }): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('mock_current_user', JSON.stringify(user));
}

function toSupabaseUserProfile(user: SupabaseUser): User {
  const metadata = user.user_metadata || {};
  const role = metadata.role === 'brand' || metadata.role === 'creator' ? metadata.role : undefined;
  const nickname = typeof metadata.nickname === 'string' ? metadata.nickname : null;
  const nameFromMetadata = typeof metadata.name === 'string' ? metadata.name : null;
  const companyName = typeof metadata.company_name === 'string' ? metadata.company_name : null;

  return {
    id: user.id,
    email: user.email || '',
    name: nameFromMetadata || nickname,
    nickname,
    role,
    company_name: companyName,
    is_active: true,
    created_at: user.created_at || new Date().toISOString(),
  };
}

function normalizeSupabaseError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다';
  }
  if (lower.includes('already registered')) {
    return '이미 등록된 이메일입니다';
  }
  if (lower.includes('email not confirmed')) {
    return '이메일 인증이 완료되지 않았습니다';
  }

  return message;
}

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
  async register(data: RegisterRequest): Promise<RegisterResult> {
    if (isMockAuthMode()) {
      return registerWithMock(data);
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name || data.nickname,
              nickname: data.nickname,
              role: data.role,
              company_name: data.company_name || null,
            },
          },
        });

        if (error) {
          throw new Error(normalizeSupabaseError(error.message));
        }

        if (!signUpData.user) {
          throw new Error('Registration failed');
        }

        const accessToken = signUpData.session?.access_token;
        if (accessToken) {
          authLib.setToken(accessToken);
        }

        return {
          user: toSupabaseUserProfile(signUpData.user),
          requiresEmailVerification: !accessToken,
          accessToken,
        };
      }
    }

    if (await isBackendAvailable()) {
      try {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          let detail = 'Registration failed';
          try {
            const error = await response.json();
            detail = error.detail || detail;
          } catch {
          }
          throw new Error(detail);
        }

        const user = await response.json();
        return {
          user,
          requiresEmailVerification: false,
        };
      } catch (error) {
        if (!isNetworkFetchError(error)) {
          throw error;
        }
      }
    }

    return registerWithMock(data);
  },

  /**
   * Login and get access token.
   * Falls back to mock auth when backend is unavailable.
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (isMockAuthMode()) {
      return loginWithMock(data);
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          throw new Error(normalizeSupabaseError(error.message));
        }

        const accessToken = signInData.session?.access_token;
        if (!accessToken) {
          throw new Error('Login failed');
        }

        authLib.setToken(accessToken);
        return { access_token: accessToken, token_type: 'bearer' };
      }
    }

    if (await isBackendAvailable()) {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          let detail = 'Login failed';
          try {
            const error = await response.json();
            detail = error.detail || detail;
          } catch {
          }
          throw new Error(detail);
        }

        const result = await response.json();
        if (result.access_token) {
          authLib.setToken(result.access_token);
        }
        return result;
      } catch (error) {
        if (!isNetworkFetchError(error)) {
          throw error;
        }
      }
    }

    return loginWithMock(data);
  },

  /**
   * Logout current user.
   */
  async logout(): Promise<void> {
    try {
      if (isMockAuthMode()) {
        return;
      }

      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.auth.signOut();
          return;
        }
      }

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
    if (isMockAuthMode()) {
      const storedUser = getStoredMockUser();
      if (storedUser) {
        const { password: _password, ...user } = storedUser;
        return user;
      }
      throw new Error('Not authenticated');
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const token = authLib.getToken();
        const { data: userData, error } = token
          ? await supabase.auth.getUser(token)
          : await supabase.auth.getUser();

        if (error || !userData.user) {
          throw new Error('Not authenticated');
        }

        return toSupabaseUserProfile(userData.user);
      }
    }

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
    if (isMockAuthMode()) {
      const storedUser = getStoredMockUser();
      if (!storedUser) {
        throw new Error('Not authenticated');
      }

      const updatedStoredUser: User & { password?: string } = {
        ...storedUser,
        ...data,
      };
      setStoredMockUser(updatedStoredUser);

      const userIndex = mockRegisteredUsers.findIndex((candidate) => candidate.id === updatedStoredUser.id);
      if (userIndex >= 0) {
        mockRegisteredUsers[userIndex] = {
          ...mockRegisteredUsers[userIndex],
          ...updatedStoredUser,
          password: mockRegisteredUsers[userIndex].password,
        };
      }

      const { password: _password, ...userWithoutPassword } = updatedStoredUser;
      return userWithoutPassword;
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const metadata: Record<string, string | null> = {};
        if (typeof data.name === 'string' || data.name === null) {
          metadata.name = data.name;
        }
        if (typeof data.nickname === 'string' || data.nickname === null) {
          metadata.nickname = data.nickname;
        }
        if (typeof data.company_name === 'string' || data.company_name === null) {
          metadata.company_name = data.company_name;
        }

        const { data: updatedData, error } = await supabase.auth.updateUser({
          data: metadata,
        });

        if (error || !updatedData.user) {
          throw new Error(normalizeSupabaseError(error?.message || 'Update failed'));
        }

        return toSupabaseUserProfile(updatedData.user);
      }
    }

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
    if (isMockAuthMode()) {
      const storedUser = getStoredMockUser();
      if (!storedUser || !storedUser.email) {
        throw new Error('Not authenticated');
      }

      const registeredUser = mockRegisteredUsers.find((candidate) => candidate.email === storedUser.email);
      const defaultUser = MOCK_USERS.find((candidate) => candidate.email === storedUser.email);
      const targetUser = registeredUser || defaultUser;

      if (!targetUser || targetUser.password !== data.current_password) {
        throw new Error('Incorrect current password');
      }

      targetUser.password = data.new_password;
      return;
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData.user?.email;

        if (!email) {
          throw new Error('Not authenticated');
        }

        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email,
          password: data.current_password,
        });

        if (verifyError) {
          throw new Error('Incorrect current password');
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: data.new_password,
        });

        if (updateError) {
          throw new Error(normalizeSupabaseError(updateError.message));
        }

        return;
      }
    }

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
    const ALLOWED_PROVIDERS = ['google', 'kakao'] as const;
    if (!ALLOWED_PROVIDERS.includes(provider)) {
      throw new Error('Invalid OAuth provider');
    }

    if (isMockAuthMode()) {
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
    }

    const ALLOWED_ORIGINS = [
      'http://localhost:8000',
      'http://localhost:3000',
    ];
    try {
      const apiOrigin = new URL(API_URL).origin;
      if (!ALLOWED_ORIGINS.includes(apiOrigin)) {
        throw new Error('Invalid API URL origin');
      }
    } catch {
      throw new Error('OAuth configuration error');
    }

    if (await isBackendAvailable()) {
      window.location.href = `${API_URL}/api/auth/${provider}`;
      return { access_token: '', token_type: 'bearer' };
    }

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
    if (isMockAuthMode()) {
      const storedUser = getStoredMockUser();
      if (!storedUser) {
        throw new Error('Not authenticated');
      }

      const userIndex = mockRegisteredUsers.findIndex((candidate) => candidate.id === storedUser.id);
      if (userIndex >= 0) {
        mockRegisteredUsers.splice(userIndex, 1);
      }

      authLib.removeToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_current_user');
      }
      return;
    }

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
