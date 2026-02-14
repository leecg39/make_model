// @TASK P4-S3-T1 - AI 모델 등록 페이지
// @SPEC Phase 4 Model Registration Screen
// @TEST tests/pages/ModelRegistration.test.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { RegistrationForm } from '@/components/model-registration/RegistrationForm';
import { modelRegistrationService } from '@/services/model-registration';
import type { ModelCreateRequest, ImagePreviewItem } from '@/types/model-registration';

export default function NewModelPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // creator 역할 체크
  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/auth/login');
      } else if (user && user.role !== 'creator') {
        router.push('/');
      }
    }
  }, [token, user, authLoading, router]);

  const handleSubmit = async (data: ModelCreateRequest, images: ImagePreviewItem[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const createdModel = await modelRegistrationService.createModel(data);

      const resolveImageUrl = async (image: ImagePreviewItem): Promise<string> => {
        if (image.source === 'generated') {
          return image.preview;
        }

        if (!image.file) {
          return image.preview;
        }

        const file = image.file;

        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('이미지 변환에 실패했습니다.'));
          reader.readAsDataURL(file);
        });
      };

      for (const image of images) {
        const imageUrl = await resolveImageUrl(image);
        await modelRegistrationService.uploadImage(createdModel.id, {
          file_url: imageUrl,
          display_order: image.display_order,
          is_thumbnail: image.is_thumbnail,
        });
      }

      router.push(`/models/${createdModel.id}`);
    } catch (err) {
      const error = err as Error;
      setError(error.message || '모델 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-neon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 권한 없음
  if (!token || (user && user.role !== 'creator')) {
    return null; // useEffect에서 리다이렉트
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">새 모델 등록</h1>
          <p className="text-white/60">
            AI 모델의 정보와 이미지를 등록하여 브랜드에게 어필하세요
          </p>
        </header>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4" role="alert">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* 등록 폼 */}
        <RegistrationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
