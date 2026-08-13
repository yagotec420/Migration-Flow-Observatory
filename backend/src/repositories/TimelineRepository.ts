import type { ITimelineRepository } from '@/interfaces/repositories/ITimelineRepository.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import type { TimelineEntry } from '@/entities/TimelineEntry.js';
import type { DateRangeFilter } from '@/types/common.types.js';

export class TimelineRepository implements ITimelineRepository {
  constructor(private readonly provider: IDataProvider) {}

  async findAll(
    params: DateRangeFilter & { countryId?: string; granularity: 'month' | 'year' },
  ): Promise<TimelineEntry[]> {
    const timeline = await this.provider.getTimeline();

    if (params.granularity === 'year') {
      const byYear = new Map<number, TimelineEntry>();
      for (const entry of timeline) {
        const existing = byYear.get(entry.year) ?? {
          year: entry.year,
          month: 0,
          outbound: 0,
          inbound: 0,
          netBalance: 0,
        };
        existing.outbound += entry.outbound;
        existing.inbound += entry.inbound;
        existing.netBalance = existing.inbound - existing.outbound;
        byYear.set(entry.year, existing);
      }
      return Array.from(byYear.values());
    }

    return timeline;
  }
}
