// @TASK P4-S3-T1 - 미리보기 버튼 및 모달
// @SPEC Phase 4 Model Registration Screen
// @TEST tests/pages/ModelRegistration.test.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModelCreateRequest } from '@/types/model-registration';
import type { ImagePreviewItem } from '@/types/model-registration';

interface PreviewButtonProps {
  formData: ModelCreateRequest;
  images: ImagePreviewItem[];
  disabled?: boolean;
}

export function PreviewButton({ formData, images, disabled = false }: PreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const thumbnailImage = images.find((img) => img.is_thumbnail) || images[0];

  return (
    <>
      {/* 미리보기 버튼 */}
      <motion.button
        onClick={handleOpen}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        className={`
          px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200
          flex items-center gap-2
          ${
            !disabled
              ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              : 'bg-white/5 text-white/40 cursor-not-allowed'
          }
        `}
        type="button"
        aria-label="모델 프로필 미리보기"
      >
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
        미리보기
      </motion.button>

      {/* 미리보기 모달 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', damping: 25 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                         sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto
                         bg-bg-primary border border-white/20 rounded-2xl shadow-2xl z-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-title"
            >
              {/* Header */}
              <div className="sticky top-0 bg-bg-primary/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <h2 id="preview-title" className="text-xl font-semibold text-white">
                  모델 프로필 미리보기
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors p-2"
                  type="button"
                  aria-label="닫기"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* 썸네일 이미지 */}
                {thumbnailImage && (
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-bg-secondary">
                    <img
                      src={thumbnailImage.preview}
                      alt="모델 썸네일"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 모델 정보 */}
                <div className="space-y-4">
                  {/* 이름 */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {formData.name || '(이름 미입력)'}
                    </h3>
                    {formData.description && (
                      <p className="text-white/70 leading-relaxed">{formData.description}</p>
                    )}
                  </div>

                  {/* 메타 정보 */}
                  <div className="flex flex-wrap gap-3">
                    {formData.style && (
                      <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full capitalize">
                        {formData.style}
                      </span>
                    )}
                    {formData.gender && (
                      <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full capitalize">
                        {formData.gender}
                      </span>
                    )}
                    {formData.age_range && (
                      <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                        {formData.age_range}
                      </span>
                    )}
                  </div>

                  {/* 태그 */}
                  {formData.tags && formData.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-white/60 mb-2">태그</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-accent-neon/10 text-accent-neon text-xs px-3 py-1.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 갤러리 */}
                  {images.length > 1 && (
                    <div>
                      <p className="text-xs text-white/60 mb-3">갤러리 ({images.length}장)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((image, index) => (
                          <div
                            key={image.id}
                            className="aspect-square rounded-lg overflow-hidden bg-bg-secondary"
                          >
                            <img
                              src={image.preview}
                              alt={`갤러리 이미지 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 상태 표시 */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40">
                      상태:{' '}
                      <span className="text-white/60">
                        {formData.status === 'active' ? '공개' : '임시 저장'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
