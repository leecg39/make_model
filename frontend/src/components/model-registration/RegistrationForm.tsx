// @TASK P4-S3-T1 - 모델 등록 폼 컴포넌트
// @SPEC Phase 4 Model Registration Screen
// @TEST tests/pages/ModelRegistration.test.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AIImageGenerator } from './AIImageGenerator';
import { AIAutoGenerate } from './AIAutoGenerate';
import { PreviewButton } from './PreviewButton';
import type { ModelCreateRequest, AIAnalysisResult, ImagePreviewItem } from '@/types/model-registration';

interface RegistrationFormProps {
  onSubmit: (data: ModelCreateRequest, images: ImagePreviewItem[]) => Promise<void>;
  isSubmitting?: boolean;
}

const STYLE_OPTIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'sporty', label: 'Sporty' },
  { value: 'street', label: 'Street' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'editorial', label: 'Editorial' },
];

const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

const AGE_RANGE_OPTIONS = [
  { value: '10s', label: '10s' },
  { value: '20s', label: '20s' },
  { value: '30s', label: '30s' },
  { value: '40s_plus', label: '40s+' },
];

const TAG_GROUPS = [
  {
    label: '스타일/무드',
    options: ['스포티', '트렌디', '캐주얼', '스트릿', '포멀', '빈티지'],
  },
  {
    label: '브랜드/활용',
    options: ['브랜드광고', 'SNS캠페인', '커머스', '룩북', '비즈니스', '오피스'],
  },
  {
    label: '타깃/채널',
    options: ['인스타', '숏폼', 'MZ세대', '영캐주얼', '하이엔드', '럭셔리'],
  },
];

export function RegistrationForm({ onSubmit, isSubmitting = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState<ModelCreateRequest>({
    name: '',
    description: '',
    style: '',
    gender: '',
    age_range: '',
    tags: [],
    status: 'draft',
  });

  const [images, setImages] = useState<ImagePreviewItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 필드 변경 핸들러
  const handleChange = (field: keyof ModelCreateRequest, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleToggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).includes(tag)
        ? (prev.tags || []).filter((t) => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  };

  // AI 분석 완료 핸들러
  const handleAIAnalysis = (result: AIAnalysisResult) => {
    setFormData((prev) => ({
      ...prev,
      style: result.style,
      tags: result.tags,
      description: result.description,
    }));
  };

  const handleGeneratedImageAdd = (url: string, prompt: string, size: string) => {
    const nextItem: ImagePreviewItem = {
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      preview: url,
      display_order: images.length,
      is_thumbnail: images.length === 0,
      source: 'generated',
      prompt,
      size,
    };

    setImages((prev) => [...prev, nextItem]);
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: '' }));
    }
  };

  const handleImagesChange = (nextImages: ImagePreviewItem[]) => {
    setImages(nextImages);
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: '' }));
    }
  };

  // 유효성 검사
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '모델 이름을 입력해주세요';
    }

    if (!formData.style) {
      newErrors.style = '스타일을 선택해주세요';
    }

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요';
    }

    if (!formData.age_range) {
      newErrors.age_range = '나이대를 선택해주세요';
    }

    if (images.length === 0) {
      newErrors.images = '최소 1장의 이미지를 업로드해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 제출 핸들러
  const handleSubmit = async (status: 'draft' | 'active') => {
    if (!validate()) return;

    const submitData = { ...formData, status };
    await onSubmit(submitData, images);
  };

  const imageUrls = images.map((img) => img.preview);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit('active');
      }}
      className="space-y-8"
    >
      {/* 이미지 업로드 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E882B2] shadow-[0_0_12px_rgba(232,130,178,0.9)]" />
          <h2 className="text-xl font-semibold text-[#f7bad4]">이미지 업로드</h2>
        </div>
        <AIImageGenerator
          onGenerated={handleGeneratedImageAdd}
          images={images}
          onImagesChange={handleImagesChange}
          disabled={isSubmitting}
        />
        {errors.images && (
          <p className="text-red-400 text-sm" role="alert">
            {errors.images}
          </p>
        )}
      </section>

      {/* AI 자동 분석 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E882B2] shadow-[0_0_12px_rgba(232,130,178,0.9)]" />
          <h2 className="text-xl font-semibold text-[#f7bad4]">AI 자동 분석</h2>
        </div>
        <AIAutoGenerate
          imageUrls={imageUrls}
          onAnalysisComplete={handleAIAnalysis}
          disabled={images.length === 0}
        />
      </section>

      {/* 기본 정보 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E882B2] shadow-[0_0_12px_rgba(232,130,178,0.9)]" />
          <h2 className="text-xl font-semibold text-[#f7bad4]">기본 정보</h2>
        </div>

        {/* 모델 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            모델 이름 <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg bg-bg-secondary border transition-colors
              text-white placeholder:text-white/40
              focus:outline-none focus:ring-2 focus:ring-accent-neon/50
              ${errors.name ? 'border-red-500' : 'border-white/10'}
            `}
            placeholder="예: Aria"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* 소개 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            소개
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="
              w-full px-4 py-3 rounded-lg bg-bg-secondary border border-white/10
              text-white placeholder:text-white/40 transition-colors
              focus:outline-none focus:ring-2 focus:ring-accent-neon/50
            "
            placeholder="모델에 대한 소개를 입력하세요"
          />
        </div>

        {/* 스타일 */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            스타일 <span className="text-red-400">*</span>
          </label>
          <div className={`rounded-lg border p-3 ${errors.style ? 'border-red-500' : 'border-white/10'}`}>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((option) => {
                const selected = formData.style === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('style', option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selected
                        ? 'bg-[#E882B2] text-black border-[#E882B2]'
                        : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          {errors.style && (
            <p id="style-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.style}
            </p>
          )}
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            성별 <span className="text-red-400">*</span>
          </label>
          <div className={`rounded-lg border p-3 ${errors.gender ? 'border-red-500' : 'border-white/10'}`}>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((option) => {
                const selected = formData.gender === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('gender', option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selected
                        ? 'bg-[#E882B2] text-black border-[#E882B2]'
                        : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          {errors.gender && (
            <p id="gender-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.gender}
            </p>
          )}
        </div>

        {/* 나이대 */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            나이대 <span className="text-red-400">*</span>
          </label>
          <div className={`rounded-lg border p-3 ${errors.age_range ? 'border-red-500' : 'border-white/10'}`}>
            <div className="flex flex-wrap gap-2">
              {AGE_RANGE_OPTIONS.map((option) => {
                const selected = formData.age_range === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('age_range', option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selected
                        ? 'bg-[#E882B2] text-black border-[#E882B2]'
                        : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          {errors.age_range && (
            <p id="age_range-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.age_range}
            </p>
          )}
        </div>

        {/* 태그 */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            태그
          </label>
          <div className="rounded-lg border border-white/10 p-3">
            <div className="space-y-3">
              {TAG_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-xs text-white/55 mb-2">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((tag) => {
                      const selected = (formData.tags || []).includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            selected
                              ? 'bg-[#E882B2] text-black border-[#E882B2]'
                              : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 태그 목록 */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label={`태그 ${tag} 삭제`}
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
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 액션 버튼 */}
      <section className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
        <PreviewButton formData={formData} images={images} disabled={images.length === 0} />

        <div className="flex-1" />

        <motion.button
          type="button"
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          className={`
            px-6 py-3 rounded-full font-semibold text-sm transition-colors
            ${
              !isSubmitting
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                : 'bg-white/5 text-white/40 cursor-not-allowed'
            }
          `}
        >
          임시 저장
        </motion.button>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          className={`
            px-6 py-3 rounded-full font-semibold text-sm transition-colors
            flex items-center justify-center gap-2
            ${
              !isSubmitting
                ? 'bg-gradient-to-r from-[#E882B2] to-[#c95d93] text-white hover:from-[#f19ec5] hover:to-[#d66ea1] shadow-[0_8px_30px_rgba(232,130,178,0.35)]'
                : 'bg-[#E882B2]/40 text-white/70 cursor-not-allowed'
            }
          `}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              등록 중...
            </>
          ) : (
            'AI모델 생성하기'
          )}
        </motion.button>
      </section>
    </form>
  );
}
