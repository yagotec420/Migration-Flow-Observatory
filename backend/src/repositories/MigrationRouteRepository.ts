import type { IMigrationRepository } from '@/interfaces/repositories/IMigrationRepository.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import type { MigrationRoute, MigrationRouteType } from '@/entities/MigrationRoute.js';
import type { PaginationParams } from '@/types/common.types.js';

export class MigrationRouteRepository implements IMigrationRepository {
  constructor(private readonly provider: IDataProvider) {}

  async findAllRoutes(
    params: PaginationParams & { type?: MigrationRouteType; year?: number },
  ): Promise<{ items: MigrationRoute[]; total: number }> {
    const all = await this.provider.getRoutes();

    const filtered = all.filter((route) => {
      const matchesType = params.type ? route.type === params.type : true;
      const matchesYear = params.year ? route.year === params.year : true;
      return matchesType && matchesYear;
    });

    const start = (params.page - 1) * params.limit;
    const items = filtered.slice(start, start + params.limit);

    return { items, total: filtered.length };
  }

  async findRouteById(id: string): Promise<MigrationRoute | null> {
    return this.provider.getRouteById(id);
  }
}
