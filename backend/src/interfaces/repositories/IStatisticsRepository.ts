import type { StatisticsSnapshot } from '@/entities/StatisticsSnapshot.js';

export interface IStatisticsRepository {
  getSnapshot(countryId?: string): Promise<StatisticsSnapshot>;
}
