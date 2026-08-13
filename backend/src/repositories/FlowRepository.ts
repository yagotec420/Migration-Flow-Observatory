import type { IFlowRepository } from '@/interfaces/repositories/IFlowRepository.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import type { MigrationFlow, FlowDirection } from '@/entities/MigrationFlow.js';
import type { PaginationParams, DateRangeFilter } from '@/types/common.types.js';

export class FlowRepository implements IFlowRepository {
  constructor(private readonly provider: IDataProvider) {}

  async findAll(
    params: PaginationParams &
      DateRangeFilter & { countryId?: string; direction?: FlowDirection },
  ): Promise<{ items: MigrationFlow[]; total: number }> {
    const all = await this.provider.getFlows();

    const filtered = all.filter((flow) => {
      const matchesCountry = params.countryId ? flow.countryId === params.countryId : true;
      const matchesDirection = params.direction ? flow.direction === params.direction : true;
      return matchesCountry && matchesDirection;
    });

    const start = (params.page - 1) * params.limit;
    const items = filtered.slice(start, start + params.limit);

    return { items, total: filtered.length };
  }
}
