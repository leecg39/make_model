// @TASK P4-S2-T1 - My Models Grid Component
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { AIModel } from '@/types/model';
import { EmptyState } from '@/components/ui/EmptyState';

interface MyModelsGridProps {
  models: AIModel[];
  isLoading: boolean;
}

export function MyModelsGrid({ models, isLoading }: MyModelsGridProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-white/60">
        로딩 중...
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <EmptyState
        variant="no_models"
        action={{
          label: '첫 번째 모델 등록하기',
          onClick: () => router.push('/models/new'),
        }}
      />
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '초안',
      active: '활성',
      published: '공개',
      paused: '일시정지',
      archived: '보관',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      active: 'bg-blue-500/20 text-blue-400',
      published: 'bg-green-500/20 text-green-400',
      paused: 'bg-yellow-500/20 text-yellow-400',
      archived: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model, index) => (
        <motion.div
          key={model.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/models/${model.id}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              router.push(`/models/${model.id}`);
            }
          }}
          className="
            bg-bg-secondary border border-white/10 rounded-2xl overflow-hidden
            hover:border-white/20 transition-all duration-300 cursor-pointer
          "
        >
          {/* Thumbnail */}
          {model.thumbnail_url ? (
            <div className="aspect-[3/4] bg-white/5 relative overflow-hidden">
              <img
                src={model.thumbnail_url}
                alt={model.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                  {getStatusLabel(model.status)}
                </span>
              </div>
            </div>
          ) : (
            <div className="aspect-[3/4] bg-white/5 flex items-center justify-center">
              <span className="text-white/40">이미지 없음</span>
            </div>
          )}

          {/* Info */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{model.name}</h3>
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>조회수: {model.view_count.toLocaleString()}</span>
              <span>평점: {model.rating?.toFixed(1) || 'N/A'}</span>
            </div>
            {model.tags && model.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {model.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
