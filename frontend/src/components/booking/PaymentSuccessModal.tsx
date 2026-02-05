// @TASK P3-S1-T1 - Payment Success Modal
// @SPEC specs/screens/booking-wizard.yaml

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  orderNumber: string;
  totalAmount: number;
  onClose: () => void;
}

export default function PaymentSuccessModal({
  isOpen,
  orderNumber,
  totalAmount,
  onClose,
}: PaymentSuccessModalProps) {
  const router = useRouter();

  const handleGoToDashboard = () => {
    onClose();
    router.push('/dashboard/brand');
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
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 id="success-title" className="text-2xl font-bold mb-2">
                  결제 완료
                </h2>

                <p className="text-gray-600 mb-6">주문이 성공적으로 완료되었습니다.</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">주문번호</span>
                    <span className="font-semibold">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="font-bold text-lg text-blue-600">
                      ₩{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <motion.button
                  onClick={handleGoToDashboard}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  대시보드로 이동
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
