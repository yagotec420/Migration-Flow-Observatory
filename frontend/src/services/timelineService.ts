import { get } from './http'; import type { TimelineEntry, TimelineFilters } from '../types/api';
export const timelineService = { list: (filters: TimelineFilters) => get<TimelineEntry[]>('/timeline', { ...filters }) };
