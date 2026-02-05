// @TASK P1-S0-T1 - UI Store (Toast, LoginModal state management)
// @SPEC Phase 1 Layout Components
'use client';

import { create } from 'zustand';

export interface Toast {
  id: string;
  variant: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  // Login Modal
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // Toast
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Login Modal
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  // Toast
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const duration = toast.duration || (toast.variant === 'error' ? 5000 : 3000);

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export default useUIStore;
