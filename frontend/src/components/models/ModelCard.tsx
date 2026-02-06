// @TASK P2-S1-T1 - Model Card component (ourcovers-inspired redesign)
// @SPEC specs/screens/home.yaml#components.popular_models_grid

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AIModel } from '@/types/model';

interface ModelCardProps {
  model: AIModel;
}

export function ModelCard({ model }: ModelCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleClick = () => {
    router.push(`/models/${model.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#1a1a1a] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#E882B2]/50 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] bg-[#111] overflow-hidden">
        {model.thumbnail_url ? (
          <motion.img
            src={model.thumbnail_url}
            alt={model.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#111]">
            <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite button */}
        <motion.button
          onClick={handleFavorite}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-[#E882B2]/80 transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-colors ${isFavorited ? 'text-[#E882B2] fill-current' : 'text-white'}`}
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>

        {/* Quick view button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <button className="w-full py-3 bg-[#E882B2] text-black font-semibold rounded-lg hover:bg-[#f598c4] transition-colors">
            상세보기
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-white mb-2 line-clamp-1 group-hover:text-[#E882B2] transition-colors">
          {model.name}
        </h3>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {model.style && (
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/70">
              {model.style}
            </span>
          )}
          {model.gender && (
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/70">
              {model.gender === 'female' ? '여성' : model.gender === 'male' ? '남성' : model.gender}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {model.rating !== null && model.rating !== undefined && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#E882B2] fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-white">{model.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-white/50">
            {model.view_count?.toLocaleString() || 0} views
          </span>
        </div>

        {model.creator && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-white/40">by </span>
            <span className="text-xs text-[#E882B2]">{model.creator.nickname}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
