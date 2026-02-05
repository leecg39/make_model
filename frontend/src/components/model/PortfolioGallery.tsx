// @TASK P2-S3-T1 - Portfolio gallery component
// @SPEC Phase 2 Model Profile Screen
'use client';

import { motion } from 'framer-motion';
import type { ModelImage } from '@/types/model';

interface PortfolioGalleryProps {
  images: ModelImage[];
  onImageClick: (index: number) => void;
}

export function PortfolioGallery({ images, onImageClick }: PortfolioGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-12 text-center">
        <p className="text-gray-600">포트폴리오 이미지가 없습니다.</p>
      </div>
    );
  }

  // Sort images by display_order
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-900">포트폴리오</h2>

      {/* Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedImages.map((image, index) => (
          <motion.button
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onImageClick(index)}
            className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <img
              src={image.image_url}
              alt={`포트폴리오 이미지 ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
