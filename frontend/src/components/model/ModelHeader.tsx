// @TASK P2-S3-T1 - Model header component
// @SPEC Phase 2 Model Profile Screen
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { favoriteService } from '@/services/favorite';
import type { AIModel } from '@/types/model';

interface ModelHeaderProps {
  model: AIModel;
}

export function ModelHeader({ model }: ModelHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Load favorite status
  useEffect(() => {
    if (user) {
      favoriteService.isFavorited(model.id).then(setIsFavorited);
    }
  }, [user, model.id]);

  const handleBookingRequest = () => {
    if (!user) {
      openLoginModal();
      return;
    }

    router.push(`/booking/new?model=${model.id}`);
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    setIsTogglingFavorite(true);

    try {
      if (isFavorited) {
        await favoriteService.removeFavorite(model.id);
        setIsFavorited(false);
        addToast({
          variant: 'success',
          message: '찜 목록에서 제거했습니다.',
        });
      } else {
        await favoriteService.addFavorite(model.id);
        setIsFavorited(true);
        addToast({
          variant: 'success',
          message: '찜 목록에 추가했습니다.',
        });
      }
    } catch (error) {
      addToast({
        variant: 'error',
        message: '오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      openLoginModal();
      return;
    }

    addToast({
      variant: 'info',
      message: '문의하기 기능 준비 중입니다.',
    });
  };

  const getGenderLabel = (gender: string | null) => {
    switch (gender) {
      case 'male':
        return '남성';
      case 'female':
        return '여성';
      case 'other':
        return '기타';
      default:
        return '미지정';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      {/* Model name and basic info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{model.name}</h1>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-sm">
          {model.style && (
            <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
              {model.style}
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
            {getGenderLabel(model.gender)}
          </span>
          {model.age_range && (
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              {model.age_range}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span>{model.view_count.toLocaleString()}</span>
        </div>

        {model.rating !== null && (
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>{model.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {model.description && (
        <p className="text-gray-700 mb-6 leading-relaxed">{model.description}</p>
      )}

      {/* Tags */}
      {model.tags && model.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {model.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleBookingRequest}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          섭외 요청하기
        </button>

        <button
          onClick={handleFavoriteToggle}
          disabled={isTogglingFavorite}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isFavorited
              ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isFavorited ? '찜 완료' : '찜하기'}
        </button>

        <button
          onClick={handleContact}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          문의하기
        </button>
      </div>
    </motion.div>
  );
}
