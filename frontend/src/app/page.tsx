// @TASK P2-S1-T1 - Home page
// @SPEC specs/screens/home.yaml
// @TEST tests/pages/Home.test.tsx

'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { PopularModelsGrid } from '@/components/home/PopularModelsGrid';
import { RecentModelsGrid } from '@/components/home/RecentModelsGrid';
import { StatsSection } from '@/components/home/StatsSection';
import { modelService } from '@/services/model';
import { statsService } from '@/services/stats';
import type { AIModel } from '@/types/model';
import type { PlatformStats } from '@/types/stats';

export default function HomePage() {
  const [popularModels, setPopularModels] = useState<AIModel[]>([]);
  const [recentModels, setRecentModels] = useState<AIModel[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const [popularLoading, setPopularLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [popularError, setPopularError] = useState<string | null>(null);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch popular models
      try {
        setPopularLoading(true);
        const popular = await modelService.getPopularModels();
        setPopularModels(popular);
        setPopularError(null);
      } catch (error: any) {
        setPopularError(error.message || '인기 모델을 불러올 수 없습니다');
        setPopularModels([]);
      } finally {
        setPopularLoading(false);
      }

      // Fetch recent models
      try {
        setRecentLoading(true);
        const recent = await modelService.getRecentModels();
        setRecentModels(recent);
        setRecentError(null);
      } catch (error: any) {
        setRecentError(error.message || '최신 모델을 불러올 수 없습니다');
        setRecentModels([]);
      } finally {
        setRecentLoading(false);
      }

      // Fetch stats
      try {
        setStatsLoading(true);
        const platformStats = await statsService.getPlatformStats();
        setStats(platformStats);
        setStatsError(null);
      } catch (error: any) {
        setStatsError(error.message || '통계를 불러올 수 없습니다');
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <HeroSection />

      <PopularModelsGrid
        models={popularModels}
        isLoading={popularLoading}
        error={popularError}
      />

      <RecentModelsGrid
        models={recentModels}
        isLoading={recentLoading}
        error={recentError}
      />

      <StatsSection
        stats={stats}
        isLoading={statsLoading}
        error={statsError}
      />
    </Layout>
  );
}
