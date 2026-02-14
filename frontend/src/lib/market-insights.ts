import { modelService } from '@/services/model';
import { statsService } from '@/services/stats';
import { PACKAGE_CATALOG } from '@/lib/package-options';
import type { AIModel } from '@/types/model';

const STYLE_LABELS: Record<string, string> = {
  casual: '캐주얼',
  formal: '포멀',
  sporty: '스포티',
  vintage: '빈티지',
  street: '스트릿',
  editorial: '에디토리얼',
};

export interface SuccessCase {
  id: string;
  modelName: string;
  creatorName: string;
  styleLabel: string;
  viewCount: number;
  rating: number;
  createdAt: string;
}

export interface MarketInsights {
  totalModels: number;
  totalBookings: number;
  totalBrands: number;
  averageWorkDays: number;
  averageRating: number;
  topSuccessCases: SuccessCase[];
  recentSuccessCases: SuccessCase[];
  recommendedPackages: typeof PACKAGE_CATALOG;
}

function toSuccessCase(model: AIModel): SuccessCase {
  const creatorName =
    model.creator && 'display_name' in model.creator
      ? model.creator.display_name
      : model.creator?.nickname || '크리에이터';

  return {
    id: model.id,
    modelName: model.name,
    creatorName,
    styleLabel: STYLE_LABELS[model.style || ''] || (model.style || '기타'),
    viewCount: model.view_count,
    rating: model.rating || 0,
    createdAt: model.created_at,
  };
}

function calculateAverageWorkDays(models: AIModel[]): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const durations = models
    .filter((model) => Boolean(model.updated_at))
    .map((model) => {
      const start = new Date(model.created_at).getTime();
      const end = new Date(model.updated_at as string).getTime();
      const days = Math.round((end - start) / msPerDay);
      return days > 0 ? days : 1;
    });

  if (durations.length === 0) {
    return 0;
  }

  const sum = durations.reduce((acc, value) => acc + value, 0);
  return Number((sum / durations.length).toFixed(1));
}

function calculateAverageRating(models: AIModel[]): number {
  const ratings = models
    .map((model) => model.rating)
    .filter((rating): rating is number => typeof rating === 'number' && rating > 0);

  if (ratings.length === 0) {
    return 0;
  }

  const sum = ratings.reduce((acc, value) => acc + value, 0);
  return Number((sum / ratings.length).toFixed(2));
}

export async function loadMarketInsights(): Promise<MarketInsights> {
  const [stats, modelResponse] = await Promise.all([
    statsService.getPlatformStats(),
    modelService.getModels({ page: 1, limit: 100 }),
  ]);

  const models = modelResponse.items;

  const topSuccessCases = [...models]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5)
    .map(toSuccessCase);

  const recentSuccessCases = [...models]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(toSuccessCase);

  return {
    totalModels: stats.total_models,
    totalBookings: stats.total_bookings,
    totalBrands: stats.total_brands,
    averageWorkDays: calculateAverageWorkDays(models),
    averageRating: calculateAverageRating(models),
    topSuccessCases,
    recentSuccessCases,
    recommendedPackages: PACKAGE_CATALOG,
  };
}
