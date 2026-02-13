import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch {
          // Ignore parse errors
        }
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
          const { state } = JSON.parse(authStorage || '{}');
          const refreshToken = state?.refreshToken;

          if (refreshToken) {
            const { data } = await axios.post(
              `${api.defaults.baseURL}/api/auth/refresh`,
              { refresh_token: refreshToken },
            );

            const newState = { ...state, token: data.access_token };
            localStorage.setItem(
              'auth-storage',
              JSON.stringify({ state: newState, version: 0 }),
            );

            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            isRefreshing = false;
            return api(originalRequest);
          }
        } catch {
          // Refresh failed
        }
        isRefreshing = false;
      }

      localStorage.removeItem('auth-storage');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export default api;
