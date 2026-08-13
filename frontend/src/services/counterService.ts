import { get } from './http'; import type { Counter, Dashboard } from '../types/api';
export const counterService = { list: () => get<Counter[]>('/counters'), dashboard: () => get<Dashboard>('/dashboard') };
