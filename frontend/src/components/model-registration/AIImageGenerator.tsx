'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { modelRegistrationService } from '@/services/model-registration';
import { ImageUploader } from './ImageUploader';
import type { ImagePreviewItem } from '@/types/model-registration';

const SIZE_OPTIONS = [
  { label: '정사각형', value: '1280x1280' },
  { label: '가로형', value: '1568x1056' },
  { label: '세로형', value: '1056x1568' },
  { label: '와이드', value: '1728x960' },
  { label: '톨', value: '960x1728' },
];

const EXAMPLE_PROMPTS = [
  'A stylish AI fashion model in a modern studio, soft cinematic lighting, detailed fabric texture',
  'Korean streetwear model portrait, neon city night background, editorial photography style',
  'Luxury formal fashion campaign, elegant pose, dramatic rim light, high-end magazine quality',
  'Sporty activewear model on minimal background, dynamic motion, commercial ad style',
];

interface AIImageGeneratorProps {
  onGenerated: (url: string, prompt: string, size: string) => void;
  images: ImagePreviewItem[];
  onImagesChange: (images: ImagePreviewItem[]) => void;
  disabled?: boolean;
}

export function AIImageGenerator({
  onGenerated,
  images,
  onImagesChange,
  disabled = false,
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1280x1280');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startProgress = () => {
    stopProgress();
    timerRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) {
          return 90;
        }
        return current + Math.random() * 12;
      });
    }, 500);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('이미지 설명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setResultUrl('');
    setProgress(0);
    startProgress();

    try {
      const generated = await modelRegistrationService.generateImage({
        prompt: prompt.trim(),
        size,
      });

      setResultUrl(generated.url);
      setProgress(100);
      onGenerated(generated.url, prompt.trim(), size);
    } catch (generationError) {
      setError((generationError as Error).message || '이미지 생성에 실패했습니다.');
    } finally {
      setLoading(false);
      stopProgress();
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-bg-secondary p-5">
      <div>
        <h3 className="text-white font-semibold">AI 이미지 생성</h3>
        <p className="text-xs text-white/50 mt-1">
          생성된 이미지는 업로드 목록에 자동 추가됩니다.
        </p>
      </div>

      <div>
        <label htmlFor="zai-prompt" className="block text-xs text-white/60 mb-1">
          이미지 설명
        </label>
        <textarea
          id="zai-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          placeholder="원하는 모델 이미지를 구체적으로 설명하세요"
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent-neon/50"
          disabled={disabled || loading}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((examplePrompt) => (
          <button
            key={examplePrompt}
            type="button"
            onClick={() => setPrompt(examplePrompt)}
            className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-white/70 hover:border-accent-neon hover:text-accent-neon transition-colors"
            disabled={disabled || loading}
          >
            예시 프롬프트
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-white/60">참고 이미지 업로드</p>
        <ImageUploader images={images} onImagesChange={onImagesChange} maxImages={10} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SIZE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSize(option.value)}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
              size === option.value
                ? 'border-accent-neon bg-accent-neon/10 text-accent-neon'
                : 'border-white/15 text-white/70 hover:border-white/30'
            }`}
            disabled={disabled || loading}
          >
            <span className="block font-medium">{option.label}</span>
            <span className="block text-[10px] opacity-70 mt-0.5">{option.value}</span>
          </button>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={handleGenerate}
        disabled={disabled || loading || !prompt.trim()}
        whileHover={!disabled && !loading && prompt.trim() ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading && prompt.trim() ? { scale: 0.98 } : {}}
        className={`w-full py-3 rounded-full font-semibold text-sm transition-colors ${
          !disabled && !loading && prompt.trim()
            ? 'bg-accent-neon text-black hover:bg-accent-neon/90'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
      >
        {loading ? '이미지 생성 중...' : 'AI 이미지 생성'}
      </motion.button>

      {loading && (
        <div className="space-y-2">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-accent-neon transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="text-xs text-white/50 text-right">{Math.round(progress)}%</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3" role="alert">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {resultUrl && (
        <div className="rounded-lg overflow-hidden border border-white/10 bg-bg-primary">
          <img src={resultUrl} alt="AI 생성 이미지" className="w-full h-48 object-cover" />
        </div>
      )}
    </div>
  );
}
