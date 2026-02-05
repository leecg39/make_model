// @TASK P2-S2-T1 - 모델 그리드 컴포넌트
// @SPEC docs/planning/domain/resources.yaml - ai_models grid
'use client';

import { motion } from 'framer-motion';
import { ModelCard } from '@/components/cards/ModelCard';
import type { AIModel } from '@/types/model';

interface ModelGridProps {
  models: AIModel[];
  favoriteIds: Set<string>;
  onToggleFavorite: (modelId: string) => void;
}

export function ModelGrid({ models, favoriteIds, onToggleFavorite }: ModelGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {models.map((model, i) => (
        <motion.div
          key={model.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <ModelCard
            id={model.id}
            name={model.name}
            thumbnailUrl={model.thumbnail_url}
            style={model.style}
            rating={model.rating}
            isFavorite={favoriteIds.has(model.id)}
            onToggleFavorite={onToggleFavorite}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
