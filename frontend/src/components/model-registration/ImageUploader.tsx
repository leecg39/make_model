// @TASK P4-S3-T1 - 이미지 업로더 컴포넌트
// @SPEC Phase 4 Model Registration Screen
// @TEST tests/pages/ModelRegistration.test.tsx
'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImagePreviewItem } from '@/types/model-registration';

interface ImageUploaderProps {
  images: ImagePreviewItem[];
  onImagesChange: (images: ImagePreviewItem[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return '지원하는 이미지 형식: JPG, PNG, WebP';
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return '이미지 크기는 10MB 이하여야 합니다';
    }

    return null;
  };

  // 파일 추가 핸들러
  const handleFilesAdd = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newImages: ImagePreviewItem[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        if (images.length + newImages.length >= maxImages) {
          errors.push(`최대 ${maxImages}장까지 업로드할 수 있습니다`);
          return;
        }

        const error = validateFile(file);
        if (error) {
          errors.push(error);
          return;
        }

        const preview = URL.createObjectURL(file);
        newImages.push({
          id: `temp-${Date.now()}-${Math.random()}`,
          file,
          preview,
          display_order: images.length + newImages.length,
          is_thumbnail: images.length === 0 && newImages.length === 0, // 첫 이미지를 썸네일로
        });
      });

      if (errors.length > 0) {
        alert(errors[0]); // 첫 번째 에러만 표시
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    },
    [images, maxImages, onImagesChange]
  );

  // 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFilesAdd(e.dataTransfer.files);
  };

  // 이미지 삭제
  const handleRemove = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    // 삭제된 이미지의 preview URL 해제
    const removed = images.find((img) => img.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.preview);
    }
    onImagesChange(updated);
  };

  // 썸네일 지정
  const handleSetThumbnail = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      is_thumbnail: img.id === id,
    }));
    onImagesChange(updated);
  };

  // 순서 변경 (위로)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // display_order 업데이트
    updated.forEach((img, i) => {
      img.display_order = i;
    });
    onImagesChange(updated);
  };

  // 순서 변경 (아래로)
  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const updated = [...images];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    // display_order 업데이트
    updated.forEach((img, i) => {
      img.display_order = i;
    });
    onImagesChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200
          ${
            isDragging
              ? 'border-accent-neon bg-accent-neon/5'
              : 'border-white/20 hover:border-white/30'
          }
        `}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFilesAdd(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={images.length >= maxImages}
          aria-label="이미지 업로드"
        />
        <div className="text-center pointer-events-none">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium text-white mb-1">
            이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-sm text-white/60">
            JPG, PNG, WebP (최대 10MB, {maxImages}장까지)
          </p>
          <p className="text-xs text-white/40 mt-2">
            {images.length} / {maxImages} 업로드됨
          </p>
        </div>
      </div>

      {/* 이미지 미리보기 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative group aspect-square rounded-lg overflow-hidden bg-bg-secondary border border-white/10"
              >
                {/* 이미지 */}
                <img
                  src={image.preview}
                  alt={`업로드 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* 썸네일 배지 */}
                {image.is_thumbnail && (
                  <div className="absolute top-2 left-2 bg-accent-neon text-black text-xs font-semibold px-2 py-1 rounded">
                    썸네일
                  </div>
                )}

                {/* 순서 표시 */}
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                  #{index + 1}
                </div>

                {/* 컨트롤 버튼 (호버 시 표시) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                  {!image.is_thumbnail && (
                    <button
                      onClick={() => handleSetThumbnail(image.id)}
                      className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded hover:bg-accent-neon transition-colors"
                      type="button"
                      aria-label={`이미지 ${index + 1}을 썸네일로 설정`}
                    >
                      썸네일 지정
                    </button>
                  )}

                  <div className="flex gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveUp(index)}
                        className="bg-white/90 text-black p-1.5 rounded hover:bg-white transition-colors"
                        type="button"
                        aria-label="위로 이동"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                    )}

                    {index < images.length - 1 && (
                      <button
                        onClick={() => handleMoveDown(index)}
                        className="bg-white/90 text-black p-1.5 rounded hover:bg-white transition-colors"
                        type="button"
                        aria-label="아래로 이동"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => handleRemove(image.id)}
                      className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                      type="button"
                      aria-label={`이미지 ${index + 1} 삭제`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
