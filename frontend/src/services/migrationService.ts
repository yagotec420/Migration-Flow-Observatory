import { get } from './http'; import type { MigrationRoute, PaginationMeta, RouteFilters } from '../types/api';
export const migrationService = { list: (filters: RouteFilters & { page?: number; limit?: number }) => get<MigrationRoute[]>('/routes', { ...filters }).then((data) => data), route: (id: string) => get<MigrationRoute>(`/routes/${id}`) };
export type PaginatedRoutes = { data: MigrationRoute[]; meta: PaginationMeta };
