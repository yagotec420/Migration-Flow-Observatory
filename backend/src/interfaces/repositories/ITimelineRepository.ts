import type { TimelineEntry } from '@/entities/TimelineEntry.js';
import type { DateRangeFilter } from '@/types/common.types.js';

export interface ITimelineRepository {
  findAll(
    params: DateRangeFilter & { countryId?: string; granularity: 'month' | 'year' },
  ): Promise<TimelineEntry[]>;
}
