import type { MigrationFlow, FlowDirection } from '@/entities/MigrationFlow.js';
import type { PaginationParams, DateRangeFilter } from '@/types/common.types.js';

export interface IFlowRepository {
  findAll(
    params: PaginationParams &
      DateRangeFilter & { countryId?: string; direction?: FlowDirection },
  ): Promise<{ items: MigrationFlow[]; total: number }>;
}
