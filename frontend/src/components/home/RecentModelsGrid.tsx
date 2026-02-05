// @TASK P2-S1-T1 - Recent Models Grid component
// @SPEC specs/screens/home.yaml#components.recent_models_grid

'use client';

import { motion } from 'framer-motion';
import type { AIModel } from '@/types/model';
import { ModelCard } from '@/components/models/ModelCard';

interface RecentModelsGridProps {
  models: AIModel[];
  isLoading?: boolean;
  error?: string | null;
}

export function RecentModelsGrid({ models, isLoading, error }: RecentModelsGridProps) {
  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">최신 등록 모델</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">최신 등록 모델</h2>
          <div className="text-center py-12">
            <p className="text-red-600">오류가 발생했습니다: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (models.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">최신 등록 모델</h2>
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 모델이 없습니다</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">최신 등록 모델</h2>

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
