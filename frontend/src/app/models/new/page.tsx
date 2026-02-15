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
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-35 pointer-events-none">
        <div className="absolute top-24 right-16 h-72 w-72 rounded-full bg-[#E882B2] blur-[130px]" />
        <div className="absolute bottom-10 left-12 h-80 w-80 rounded-full bg-[#b45bd8] blur-[160px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* 헤더 */}
        <header className="mb-8 rounded-2xl border border-[#E882B2]/25 bg-[#111]/85 p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl border border-[#E882B2]/40 bg-gradient-to-br from-[#f7bad4]/40 via-[#E882B2]/25 to-[#9f5bd1]/30 flex items-center justify-center shadow-[0_10px_30px_rgba(232,130,178,0.3)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 64 64"
                className="h-8 w-8 text-[#ffd2e7]"
                fill="none"
              >
                <circle cx="32" cy="18" r="7" stroke="currentColor" strokeWidth="2.8" />
                <path
                  d="M17 28c2-7 7-12 15-12s13 5 15 12v7h-5v-6c0-5-4-9-10-9s-10 4-10 9v6h-5v-7z"
                  fill="currentColor"
                  fillOpacity="0.22"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M22 51V39c0-6 4-10 10-10s10 4 10 10v12"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <path
                  d="M25 56h14"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#f3b7d6]/85 font-semibold">Model Studio</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#f7bad4]">새 모델 등록</h1>
            </div>
          </div>
          <p className="text-[#f3b7d6]/85">
            AI 모델의 정보와 이미지를 등록하여 브랜드에게 어필하세요
          </p>
        </header>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4" role="alert">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* 등록 폼 */}
        <div className="rounded-2xl border border-white/10 bg-[#111]/85 p-6 sm:p-8 backdrop-blur-sm">
          <RegistrationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}
