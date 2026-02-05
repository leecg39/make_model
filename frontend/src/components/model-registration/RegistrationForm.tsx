// @TASK P4-S3-T1 - 모델 등록 폼 컴포넌트
// @SPEC Phase 4 Model Registration Screen
// @TEST tests/pages/ModelRegistration.test.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageUploader } from './ImageUploader';
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
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 필드 변경 핸들러
  const handleChange = (field: keyof ModelCreateRequest, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // 태그 추가
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    if (formData.tags && formData.tags.includes(trimmed)) {
      alert('이미 추가된 태그입니다');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), trimmed],
    }));
    setTagInput('');
  };

  // 태그 삭제
  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
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
        <h2 className="text-xl font-semibold text-white">이미지 업로드</h2>
        <ImageUploader images={images} onImagesChange={setImages} maxImages={10} />
        {errors.images && (
          <p className="text-red-400 text-sm" role="alert">
            {errors.images}
          </p>
        )}
      </section>

      {/* AI 자동 분석 섹션 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">AI 자동 분석</h2>
        <AIAutoGenerate
          imageUrls={imageUrls}
          onAnalysisComplete={handleAIAnalysis}
          disabled={images.length === 0}
        />
      </section>

      {/* 기본 정보 섹션 */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-white">기본 정보</h2>

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
          <label htmlFor="style" className="block text-sm font-medium text-white mb-2">
            스타일 <span className="text-red-400">*</span>
          </label>
          <select
            id="style"
            value={formData.style}
            onChange={(e) => handleChange('style', e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg bg-bg-secondary border transition-colors
              text-white
              focus:outline-none focus:ring-2 focus:ring-accent-neon/50
              ${errors.style ? 'border-red-500' : 'border-white/10'}
            `}
            aria-invalid={!!errors.style}
            aria-describedby={errors.style ? 'style-error' : undefined}
          >
            <option value="">선택하세요</option>
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.style && (
            <p id="style-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.style}
            </p>
          )}
        </div>

        {/* 성별 */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-white mb-2">
            성별 <span className="text-red-400">*</span>
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg bg-bg-secondary border transition-colors
              text-white
              focus:outline-none focus:ring-2 focus:ring-accent-neon/50
              ${errors.gender ? 'border-red-500' : 'border-white/10'}
            `}
            aria-invalid={!!errors.gender}
            aria-describedby={errors.gender ? 'gender-error' : undefined}
          >
            <option value="">선택하세요</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.gender && (
            <p id="gender-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.gender}
            </p>
          )}
        </div>

        {/* 나이대 */}
        <div>
          <label htmlFor="age_range" className="block text-sm font-medium text-white mb-2">
            나이대 <span className="text-red-400">*</span>
          </label>
          <select
            id="age_range"
            value={formData.age_range}
            onChange={(e) => handleChange('age_range', e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg bg-bg-secondary border transition-colors
              text-white
              focus:outline-none focus:ring-2 focus:ring-accent-neon/50
              ${errors.age_range ? 'border-red-500' : 'border-white/10'}
            `}
            aria-invalid={!!errors.age_range}
            aria-describedby={errors.age_range ? 'age_range-error' : undefined}
          >
            <option value="">선택하세요</option>
            {AGE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.age_range && (
            <p id="age_range-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.age_range}
            </p>
          )}
        </div>

        {/* 태그 */}
        <div>
          <label htmlFor="tag-input" className="block text-sm font-medium text-white mb-2">
            태그
          </label>
          <div className="flex gap-2">
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="
                flex-1 px-4 py-3 rounded-lg bg-bg-secondary border border-white/10
                text-white placeholder:text-white/40 transition-colors
                focus:outline-none focus:ring-2 focus:ring-accent-neon/50
              "
              placeholder="태그 입력 후 Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
            >
              추가
            </button>
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
                    onClick={() => handleRemoveTag(tag)}
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
                ? 'bg-accent-neon text-black hover:bg-accent-neon/90'
                : 'bg-accent-neon/50 text-black/50 cursor-not-allowed'
            }
          `}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              등록 중...
            </>
          ) : (
            '공개 등록'
          )}
        </motion.button>
      </section>
    </form>
  );
}
