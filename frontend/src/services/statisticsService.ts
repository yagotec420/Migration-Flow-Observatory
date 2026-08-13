import { get } from './http'; import type { Statistics } from '../types/api';
export const statisticsService = { get: (countryId?: string) => get<Statistics>('/statistics', { countryId }) };
