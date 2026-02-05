// @TASK P2-S3-T1 - Model profile page (dynamic route)
// @SPEC Phase 2 Model Profile Screen
// @TEST tests/pages/ModelProfile.test.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { modelService } from '@/services/model';
import { ModelHeader } from '@/components/model/ModelHeader';
import { PortfolioGallery } from '@/components/model/PortfolioGallery';
import { CreatorInfo } from '@/components/model/CreatorInfo';
import { ImageLightbox } from '@/components/model/ImageLightbox';
import type { AIModel } from '@/types/model';

export default function ModelProfilePage() {
  const params = useParams();
  const modelId = params?.id as string;

  const [model, setModel] = useState<AIModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const loadModel = async () => {
      if (!modelId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await modelService.getModelById(modelId);
        setModel(data);

        // Increment view count (fire and forget)
        modelService.incrementViewCount(modelId).catch(() => {
          // Ignore errors for view count
        });
      } catch (err: any) {
        setError(err.message || '모델 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [modelId]);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleLightboxNext = () => {
    if (model && lightboxIndex < model.images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const handleLightboxPrevious = () => {
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !model) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류 발생</h2>
          <p className="text-gray-600">{error || '모델을 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Model Header */}
          <ModelHeader model={model} />

          {/* Portfolio Gallery */}
          <PortfolioGallery images={model.images} onImageClick={handleImageClick} />

          {/* Creator Info */}
          <CreatorInfo creator={model.creator} />
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={model.images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={handleLightboxNext}
        onPrevious={handleLightboxPrevious}
      />
    </div>
  );
}
