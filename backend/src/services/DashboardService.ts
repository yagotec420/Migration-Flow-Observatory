import type { CounterService } from '@/services/CounterService.js';
import type { StatisticsService } from '@/services/StatisticsService.js';
import type { TimelineService } from '@/services/TimelineService.js';
import type { MigrationService } from '@/services/MigrationService.js';
import type { DashboardDTO } from '@/dtos/DashboardDTO.js';

/**
 * Service agregador: compõe dados de múltiplos domínios em um único
 * DTO para a tela inicial do dashboard, evitando 4 round-trips do
 * frontend na primeira renderização. Não contém regra de negócio
 * própria — apenas orquestra os Services especializados.
 */
export class DashboardService {
  constructor(
    private readonly counterService: CounterService,
    private readonly statisticsService: StatisticsService,
    private readonly timelineService: TimelineService,
    private readonly migrationService: MigrationService,
  ) {}

  async getSummary(): Promise<DashboardDTO> {
    const [counters, statistics, recentTimeline, routesPage] = await Promise.all([
      this.counterService.list(),
      this.statisticsService.getSnapshot(),
      this.timelineService.list({ granularity: 'month' }),
      this.migrationService.list({ page: 1, limit: 5 }),
    ]);

    return {
      counters,
      statistics,
      recentTimeline: recentTimeline.slice(-6),
      highlightedRoutes: routesPage.items,
    };
  }
}
