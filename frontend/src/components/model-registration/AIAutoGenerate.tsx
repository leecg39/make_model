// @TASK P4-S3-T1 - AI 자동 분석 컴포넌트
// @SPEC Phase 4 Model Registration Screen
// @TEST tests/pages/ModelRegistration.test.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { modelRegistrationService } from '@/services/model-registration';
import type { AIAnalysisResult } from '@/types/model-registration';

interface AIAutoGenerateProps {
  imageUrls: string[]; // 업로드된 이미지 URL 목록
  onAnalysisComplete: (result: AIAnalysisResult) => void;
  disabled?: boolean;
}

export function AIAutoGenerate({
  imageUrls,
  onAnalysisComplete,
  disabled = false,
}: AIAutoGenerateProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (imageUrls.length === 0) {
      setError('분석할 이미지를 먼저 업로드해주세요');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResult = await modelRegistrationService.analyzeImages(imageUrls);
      setResult(analysisResult);
      onAnalysisComplete(analysisResult);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'AI 분석에 실패했습니다');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onAnalysisComplete(result);
    }
  };

  const canAnalyze = imageUrls.length > 0 && !disabled && !isAnalyzing;

  return (
    <div className="space-y-4">
      {/* AI 분석 버튼 */}
      <motion.button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        whileHover={canAnalyze ? { scale: 1.02 } : {}}
        whileTap={canAnalyze ? { scale: 0.98 } : {}}
        className={`
          w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200
          flex items-center justify-center gap-2
          ${
            canAnalyze
              ? 'bg-accent-neon text-black hover:bg-accent-neon/90'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }
        `}
        type="button"
        aria-busy={isAnalyzing}
        aria-label="AI 자동 분석 실행"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>AI 분석 중...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>AI 자동 분석</span>
          </>
        )}
      </motion.button>

      {/* 에러 메시지 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
          role="alert"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* 분석 결과 */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-bg-secondary border border-white/10 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              AI 분석 완료
            </h3>
            <button
              onClick={handleApply}
              className="text-accent-neon text-sm font-medium hover:text-accent-neon/80 transition-colors"
              type="button"
            >
              폼에 적용
            </button>
          </div>

          <div className="space-y-3">
            {/* 스타일 */}
            <div>
              <p className="text-xs text-white/60 mb-1">추천 스타일</p>
              <p className="text-white font-medium capitalize">{result.style}</p>
            </div>

            {/* 태그 */}
            <div>
              <p className="text-xs text-white/60 mb-2">추천 태그</p>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 소개 */}
            <div>
              <p className="text-xs text-white/60 mb-1">추천 소개</p>
              <p className="text-white/80 text-sm leading-relaxed">{result.description}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-white/40">
              * AI 분석 결과는 참고용이며, 자유롭게 수정할 수 있습니다.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
