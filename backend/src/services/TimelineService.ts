import type { ITimelineRepository } from '@/interfaces/repositories/ITimelineRepository.js';
import type { TimelineDTO } from '@/dtos/TimelineDTO.js';
import type { DateRangeFilter } from '@/types/common.types.js';

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export class TimelineService {
  constructor(private readonly timelineRepository: ITimelineRepository) {}

  async list(
    params: DateRangeFilter & { countryId?: string; granularity: 'month' | 'year' },
  ): Promise<TimelineDTO[]> {
    const entries = await this.timelineRepository.findAll(params);

    return entries.map((entry) => ({
      period: {
        year: entry.year,
        month: entry.month,
        label:
          params.granularity === 'year'
            ? `${entry.year}`
            : `${MONTH_LABELS[entry.month - 1] ?? entry.month}/${entry.year}`,
      },
      outbound: entry.outbound,
      inbound: entry.inbound,
      netBalance: entry.netBalance,
    }));
  }
}
