// @TASK P1-S0-T1 - AI Model Card component
// @SPEC Phase 1 Layout Components
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

export interface ModelCardProps {
  id: string;
  name: string;
  thumbnailUrl: string;
  style: string;
  rating: number;
  isFavorite?: boolean;
  onToggleFavorite?: (modelId: string) => void;
}

export function ModelCard({
  id,
  name,
  thumbnailUrl,
  style,
  rating,
  isFavorite = false,
  onToggleFavorite,
}: ModelCardProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const [isLiked, setIsLiked] = useState(isFavorite);

  const handleCardClick = () => {
    router.push(`/models/${id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      openLoginModal();
      return;
    }

    setIsLiked(!isLiked);
    onToggleFavorite?.(id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleCardClick}
      className="group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden mb-3">
        <img
          src={thumbnailUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          aria-label={isLiked ? '찜 취소' : '찜하기'}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-gray-700'
            }`}
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </motion.button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1">
          <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-white text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-base group-hover:text-indigo-600 transition-colors truncate">
          {name}
        </h3>
        <p className="text-sm text-gray-600 truncate">{style}</p>
      </div>
    </motion.div>
  );
}
