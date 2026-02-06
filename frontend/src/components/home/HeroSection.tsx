// @TASK P2-S1-T1 - Hero Section component (ourcovers-inspired redesign)
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#111]">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E882B2] rounded-full filter blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E882B2] rounded-full filter blur-[120px] animate-pulse delay-1000" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Logo/Brand */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6"
          >
            <span className="text-white">MAKE</span>
            <span className="text-[#E882B2]"> MODEL</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/70 mb-4 tracking-widest uppercase"
          >
            AI 인플루언서 마켓플레이스
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg text-white/50 mb-12 max-w-2xl mx-auto"
          >
            브랜드와 AI 모델을 연결하는 프리미엄 플랫폼
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(232, 130, 178, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExplore}
              className="px-10 py-4 bg-[#E882B2] text-black rounded-lg font-semibold text-lg transition-all duration-300"
            >
              모델 탐색
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, borderColor: '#E882B2', color: '#E882B2' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegisterModel}
              className="px-10 py-4 bg-transparent text-white rounded-lg font-semibold text-lg border border-white/30 hover:border-[#E882B2] transition-all duration-300"
            >
              모델 등록
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-3 bg-[#E882B2] rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
