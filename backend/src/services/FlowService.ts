import type { IFlowRepository } from '@/interfaces/repositories/IFlowRepository.js';
import type { ICountryRepository } from '@/interfaces/repositories/ICountryRepository.js';
import type { FlowDirection } from '@/entities/MigrationFlow.js';
import type { FlowDTO } from '@/dtos/FlowDTO.js';
import type { PaginationParams, DateRangeFilter, PaginationMeta } from '@/types/common.types.js';

export class FlowService {
  constructor(
    private readonly flowRepository: IFlowRepository,
    private readonly countryRepository: ICountryRepository,
  ) {}

  async list(
    params: PaginationParams &
      DateRangeFilter & { countryId?: string; direction?: FlowDirection },
  ): Promise<{ items: FlowDTO[]; meta: PaginationMeta }> {
    const { items, total } = await this.flowRepository.findAll(params);

    const dtos = await Promise.all(
      items.map(async (flow): Promise<FlowDTO> => {
        const country = await this.countryRepository.findById(flow.countryId);
        return {
          id: flow.id,
          countryId: flow.countryId,
          countryName: country?.name ?? 'Desconhecido',
          direction: flow.direction,
          period: { year: flow.year, month: flow.month },
          estimatedPeople: flow.estimatedPeople,
        };
      }),
    );

    return {
      items: dtos,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.limit)),
      },
    };
  }
}
