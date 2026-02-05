// @TASK P2-S1-T1 - Platform stats service (API client)
// @SPEC specs/screens/home.yaml#data_requirements

import api from './api';
import type { PlatformStats } from '@/types/stats';

/**
 * Platform statistics API service
 */
class StatsService {
  /**
   * Get platform-wide statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const { data } = await api.get<PlatformStats>('/api/stats');
    return data;
  }
}

export const statsService = new StatsService();
