// @TASK P2-S1-T1 - Model Card component
// @SPEC specs/screens/home.yaml#components.popular_models_grid

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { AIModel } from '@/types/model';

interface ModelCardProps {
  model: AIModel;
}

export function ModelCard({ model }: ModelCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/models/${model.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {model.thumbnail_url ? (
          <img
            src={model.thumbnail_url}
            alt={model.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
          {model.name}
        </h3>

        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          {model.style && (
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
              {model.style}
            </span>
          )}
          {model.rating !== null && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">{model.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{model.creator.nickname}</span>
          <span>{model.view_count.toLocaleString()} views</span>
        </div>
      </div>
    </motion.div>
  );
}
