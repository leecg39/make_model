// @TASK P2-S1-T1 - Popular Models Grid component (ourcovers-inspired redesign)
// @SPEC specs/screens/home.yaml#components.popular_models_grid

'use client';

import { motion } from 'framer-motion';
import type { AIModel } from '@/types/model';
import { ModelCard } from '@/components/models/ModelCard';

interface PopularModelsGridProps {
  models: AIModel[];
  isLoading?: boolean;
  error?: string | null;
}

export function PopularModelsGrid({ models, isLoading, error }: PopularModelsGridProps) {
  if (isLoading) {
    return (
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12">
            인기 <span className="text-[#E882B2]">모델</span>
          </h2>
          <div
            data-testid="loading-popular-models"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#1a1a1a] rounded-2xl mb-4" />
                <div className="h-5 bg-[#1a1a1a] rounded-lg mb-3" />
                <div className="h-4 bg-[#1a1a1a] rounded-lg w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12">
            인기 <span className="text-[#E882B2]">모델</span>
          </h2>
          <div className="text-center py-16 bg-[#111] rounded-2xl border border-white/5">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (models.length === 0) {
    return (
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12">
            인기 <span className="text-[#E882B2]">모델</span>
          </h2>
          <div className="text-center py-16 bg-[#111] rounded-2xl border border-white/5">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-white/50 text-lg">등록된 모델이 없습니다</p>
            <p className="text-white/30 mt-2">첫 번째 AI 모델을 등록해보세요</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              인기 <span className="text-[#E882B2]">모델</span>
            </h2>
            <motion.a
              href="/explore?sort=popular"
              whileHover={{ x: 5 }}
              className="text-white/60 hover:text-[#E882B2] font-medium flex items-center gap-2 transition-colors"
            >
              더보기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {models.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ModelCard model={model} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
