// @TASK P2-S1-T1 - Hero Section component
// @SPEC specs/screens/home.yaml#components.hero_section

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

export function HeroSection() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const openLoginModal = useUIStore((state) => state.openLoginModal);

  const handleExplore = () => {
    router.push('/explore');
  };

  const handleRegisterModel = () => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (user.role === 'creator') {
      router.push('/models/new');
    } else {
      openLoginModal();
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            AI 인플루언서 마켓플레이스
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            브랜드와 AI 모델을 연결하는 플랫폼, Make Model
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExplore}
              className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors shadow-lg"
            >
              탐색하기
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegisterModel}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-900 hover:bg-gray-50 transition-colors"
            >
              모델 등록하기
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
