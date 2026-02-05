// @TASK P3-S1-T1 - Step 2 AI Recommendation
// @SPEC specs/screens/booking-wizard.yaml

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MatchingRecommendation } from '@/types/booking';

interface Step2RecommendationProps {
  recommendations: MatchingRecommendation[];
  onSelect: (model: MatchingRecommendation['model']) => void;
}

export default function Step2Recommendation({ recommendations, onSelect }: Step2RecommendationProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedModelId) {
      setError('모델을 선택해주세요.');
      return;
    }

    const selected = recommendations.find((rec) => rec.model.id === selectedModelId);
    if (selected) {
      onSelect(selected.model);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">AI 추천 결과</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {recommendations.map((rec, index) => (
            <motion.label
              key={rec.model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                selectedModelId === rec.model.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="model"
                value={rec.model.id}
                checked={selectedModelId === rec.model.id}
                onChange={() => setSelectedModelId(rec.model.id)}
                className="sr-only"
                aria-label={`${rec.model.name} 선택`}
              />

              {rec.model.thumbnail_url && (
                <img
                  src={rec.model.thumbnail_url}
                  alt={rec.model.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{rec.model.name}</h3>
                  <span className="text-blue-600 font-bold">{rec.score}%</span>
                </div>

                <div className="flex gap-2 text-sm text-gray-600">
                  <span>{rec.model.style}</span>
                  <span>·</span>
                  <span>{rec.model.gender}</span>
                  <span>·</span>
                  <span>{rec.model.age_range}</span>
                </div>

                {rec.model.tags && rec.model.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.model.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <span>조회 {rec.model.view_count.toLocaleString()}</span>
                  {rec.model.rating && (
                    <>
                      <span>·</span>
                      <span>⭐ {rec.model.rating.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.label>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

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
