import type { MigrationRoute, MigrationRouteType } from '@/entities/MigrationRoute.js';
import type { PaginationParams } from '@/types/common.types.js';

export interface IMigrationRepository {
  findAllRoutes(
    params: PaginationParams & { type?: MigrationRouteType; year?: number },
  ): Promise<{ items: MigrationRoute[]; total: number }>;
  findRouteById(id: string): Promise<MigrationRoute | null>;
}
