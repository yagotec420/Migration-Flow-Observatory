import type { IStatisticsRepository } from '@/interfaces/repositories/IStatisticsRepository.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import type { StatisticsSnapshot } from '@/entities/StatisticsSnapshot.js';

export class StatisticsRepository implements IStatisticsRepository {
  constructor(private readonly provider: IDataProvider) {}

  async getSnapshot(countryId?: string): Promise<StatisticsSnapshot> {
    const [flows, routes] = await Promise.all([
      this.provider.getFlows(),
      this.provider.getRoutes(),
    ]);

    const scopedFlows = countryId ? flows.filter((flow) => flow.countryId === countryId) : flows;

    const totalOutbound = scopedFlows
      .filter((flow) => flow.direction === 'outbound')
      .reduce((sum, flow) => sum + flow.estimatedPeople, 0);

    const totalInbound = scopedFlows
      .filter((flow) => flow.direction === 'inbound')
      .reduce((sum, flow) => sum + flow.estimatedPeople, 0);

    const scopedRoutes = countryId
      ? routes.filter(
          (route) => route.originCountryId === countryId || route.destinationCountryId === countryId,
        )
      : routes;

    const topRoutes = [...scopedRoutes]
      .sort((a, b) => b.estimatedVolume - a.estimatedVolume)
      .slice(0, 5)
      .map((route) => ({ routeId: route.id, estimatedVolume: route.estimatedVolume }));

    return {
      scope: countryId ? 'country' : 'global',
      countryId,
      totalOutbound,
      totalInbound,
      netBalance: totalInbound - totalOutbound,
      topRoutes,
      lastUpdated: new Date().toISOString(),
    };
  }
}
