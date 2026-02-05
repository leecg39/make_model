// @TASK P4-S2-T1 - Creator Models Page
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/creator-dashboard/DashboardNav';
import { MyModelsGrid } from '@/components/creator-dashboard/MyModelsGrid';
import api from '@/services/api';
import type { AIModel, ModelsResponse } from '@/types/model';

export default function CreatorModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ModelsResponse>('/api/models', {
        params: { creator_id: 'me' },
      });
      setModels(response.data.items);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <DashboardNav />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">내 모델</h1>

          <MyModelsGrid models={models} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
