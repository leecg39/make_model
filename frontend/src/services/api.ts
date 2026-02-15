import axios from 'axios';
import { authLib } from '@/lib/auth';
import { isMockAuthMode } from '@/lib/auth-mode';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  adapter: ['fetch', 'xhr', 'http'],
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      let accessToken: string | null = null;
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (typeof state?.token === 'string' && state.token) {
            accessToken = state.token;
          }
        } catch {
          // Ignore parse errors
        }
      }

      if (!accessToken) {
        accessToken = authLib.getToken();
      }

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with automatic token refresh
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && typeof window !== 'undefined' && isMockAuthMode()) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const authStorage = localStorage.getItem('auth-storage');
          const parsed = JSON.parse(authStorage || '{}');
          const state = parsed?.state || {};
          const refreshToken = state?.refreshToken || localStorage.getItem('refresh_token');

          if (refreshToken) {
            const { data } = await axios.post(
              `${api.defaults.baseURL}/api/auth/refresh`,
              { refresh_token: refreshToken },
            );

            const nextRefreshToken = data.refresh_token || refreshToken;
            authLib.setToken(data.access_token);
            localStorage.setItem('refresh_token', nextRefreshToken);

            const newState = {
              ...state,
              token: data.access_token,
              refreshToken: nextRefreshToken,
            };
            localStorage.setItem(
              'auth-storage',
              JSON.stringify({ ...parsed, state: newState, version: parsed?.version ?? 0 }),
            );

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            }
            isRefreshing = false;
            return api(originalRequest);
          }
        } catch {
          // Refresh failed
        }
        isRefreshing = false;
      }

      authLib.removeToken();
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export default api;
