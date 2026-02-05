// @TASK P1-S0-T1 - Login Modal component
// @SPEC Phase 1 Layout Components
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui';

export function LoginModal() {
  const isOpen = useUIStore((state) => state.isLoginModalOpen);
  const closeModal = useUIStore((state) => state.closeLoginModal);
  const router = useRouter();

  const handleLogin = () => {
    closeModal();
    router.push('/auth/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 text-center mb-2">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-600 text-center mb-6">
                이 기능을 사용하려면 로그인이 필요합니다.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  로그인
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
