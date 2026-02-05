// @TASK P3-S1-T1 - Step 1 Concept Form
// @SPEC specs/screens/booking-wizard.yaml

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Step1ConceptFormProps {
  onSubmit: (concept: string, images: string[]) => void;
}

export default function Step1ConceptForm({ onSubmit }: Step1ConceptFormProps) {
  const [concept, setConcept] = useState('');
  const [images, setImages] = useState<string[]>(['', '', '']);
  const [errors, setErrors] = useState<{ concept?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!concept.trim()) {
      setErrors({ concept: '콘셉트 설명을 입력해주세요.' });
      return;
    }

    if (concept.length > 500) {
      setErrors({ concept: '콘셉트 설명은 최대 500자까지 입력 가능합니다.' });
      return;
    }

    // Filter out empty image URLs
    const validImages = images.filter((img) => img.trim() !== '');

    onSubmit(concept, validImages);
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">콘셉트 입력</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="concept" className="block text-sm font-medium mb-2">
            콘셉트 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.concept ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={6}
            placeholder="원하시는 콘셉트를 자세히 설명해주세요. (예: 캐주얼한 여름 휴가 콘셉트, 자연스러운 일상 느낌)"
            aria-invalid={!!errors.concept}
            aria-describedby={errors.concept ? 'concept-error' : undefined}
          />
          <div className="flex justify-between mt-1">
            <div>
              {errors.concept && (
                <p id="concept-error" className="text-sm text-red-500" role="alert">
                  {errors.concept}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500">{concept.length} / 500</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">참고 이미지 URL (선택)</label>
          <div className="space-y-3">
            {images.map((img, index) => (
              <input
                key={index}
                type="url"
                value={img}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder={`이미지 URL ${index + 1}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">최대 3개까지 추가 가능합니다.</p>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          다음
        </motion.button>
      </form>
    </motion.div>
  );
}
