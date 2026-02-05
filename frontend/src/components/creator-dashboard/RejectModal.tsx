// @TASK P4-S2-T1 - Reject Order Modal Component
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RejectModalProps {
  isOpen: boolean;
  orderId: string;
  onConfirm: (orderId: string, reason: string) => void;
  onCancel: () => void;
}

export function RejectModal({
  isOpen,
  orderId,
  onConfirm,
  onCancel,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('거절 사유를 입력해주세요');
      return;
    }
    onConfirm(orderId, reason);
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={handleCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          onClick={(e) => e.stopPropagation()}
          className="bg-bg-secondary border border-white/10 rounded-2xl p-6 w-full max-w-md"
        >
          <h2 id="reject-modal-title" className="text-xl font-bold text-white mb-4">
            주문 거절
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="rejection-reason" className="block text-sm text-white/80 mb-2">
                거절 사유
              </label>
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder="거절 사유를 입력해주세요"
                rows={4}
                className="
                  w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                  text-white placeholder-white/40
                  focus:border-accent-neon focus:outline-none
                "
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="px-6 py-2 bg-white/10 text-white rounded-lg"
              >
                취소
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold"
              >
                거절하기
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
