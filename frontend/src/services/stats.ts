// @TASK P2-S1-T1 - Platform stats service (API client)
// @SPEC specs/screens/home.yaml#data_requirements

import api from './api';
import type { PlatformStats } from '@/types/stats';

// Mock 모드: 백엔드 없이 Mock 데이터 사용
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true;

// Mock stats data
const MOCK_STATS: PlatformStats = {
  total_models: 12,
  total_bookings: 156,
  total_brands: 48,
};

/**
 * Platform statistics API service
 */
class StatsService {
  /**
   * Get platform-wide statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    // Mock 모드
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_STATS;
    }

    const { data } = await api.get<PlatformStats>('/api/stats');
    return data;
  }
}

export const statsService = new StatsService();
