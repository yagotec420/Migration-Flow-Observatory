import { get } from './http'; import type { Country } from '../types/api';
export const countryService = { list: () => get<Country[]>('/countries', { limit: 100 }) };
