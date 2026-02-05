// @TASK P2-S3-T1 - Creator info card component
// @SPEC Phase 2 Model Profile Screen
'use client';

import { motion } from 'framer-motion';
import type { ModelCreator } from '@/types/model';

interface CreatorInfoProps {
  creator: ModelCreator;
}

export function CreatorInfo({ creator }: CreatorInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">크리에이터 정보</h3>

      <div className="flex items-center gap-4">
        {/* Profile image */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
          {creator.profile_image ? (
            <img
              src={creator.profile_image}
              alt={creator.nickname || '크리에이터'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Creator details */}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {creator.nickname || '크리에이터'}
          </p>
          <p className="text-sm text-gray-600">{creator.email}</p>
        </div>
      </div>
    </motion.div>
  );
}
