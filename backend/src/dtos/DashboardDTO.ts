import type { CounterDTO } from '@/dtos/CounterDTO.js';
import type { StatisticsDTO } from '@/dtos/StatisticsDTO.js';
import type { TimelineDTO } from '@/dtos/TimelineDTO.js';
import type { RouteDTO } from '@/dtos/RouteDTO.js';

/**
 * DTO agregador consumido pela tela inicial do dashboard — evita que
 * o frontend precise disparar 4 requisições separadas na primeira
 * renderização.
 */
export interface DashboardDTO {
  counters: CounterDTO[];
  statistics: StatisticsDTO;
  recentTimeline: TimelineDTO[];
  highlightedRoutes: RouteDTO[];
}
