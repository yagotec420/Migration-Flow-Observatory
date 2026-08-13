import type { IStatisticsRepository } from '@/interfaces/repositories/IStatisticsRepository.js';
import type { StatisticsDTO } from '@/dtos/StatisticsDTO.js';

export class StatisticsService {
  constructor(private readonly statisticsRepository: IStatisticsRepository) {}

  async getSnapshot(countryId?: string): Promise<StatisticsDTO> {
    const snapshot = await this.statisticsRepository.getSnapshot(countryId);

    return {
      scope: snapshot.scope,
      countryId: snapshot.countryId,
      totals: {
        outbound: snapshot.totalOutbound,
        inbound: snapshot.totalInbound,
        netBalance: snapshot.netBalance,
      },
      topRoutes: snapshot.topRoutes,
      lastUpdated: snapshot.lastUpdated,
    };
  }
}
