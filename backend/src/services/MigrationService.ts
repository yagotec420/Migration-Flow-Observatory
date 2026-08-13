import type { IMigrationRepository } from '@/interfaces/repositories/IMigrationRepository.js';
import type { ICountryRepository } from '@/interfaces/repositories/ICountryRepository.js';
import type { MigrationRoute, MigrationRouteType } from '@/entities/MigrationRoute.js';
import type { RouteDTO } from '@/dtos/RouteDTO.js';
import type { PaginationParams, PaginationMeta } from '@/types/common.types.js';
import { NotFoundError } from '@/errors/NotFoundError.js';

/**
 * Regra de negócio do domínio de rotas migratórias. Orquestra dois
 * repositories (rotas + países) para compor o DTO enriquecido que o
 * frontend consome — os Controllers nunca fazem essa composição.
 */
export class MigrationService {
  constructor(
    private readonly migrationRepository: IMigrationRepository,
    private readonly countryRepository: ICountryRepository,
  ) {}

  private async toRouteDTO(route: MigrationRoute): Promise<RouteDTO | null> {
    const [origin, destination] = await Promise.all([
      this.countryRepository.findById(route.originCountryId),
      this.countryRepository.findById(route.destinationCountryId),
    ]);

    if (!origin || !destination) {
      return null;
    }

    return {
      id: route.id,
      type: route.type,
      year: route.year,
      estimatedVolume: route.estimatedVolume,
      origin: {
        countryId: origin.id,
        isoCode: origin.isoCode,
        name: origin.name,
        coordinates: { latitude: origin.latitude, longitude: origin.longitude },
      },
      destination: {
        countryId: destination.id,
        isoCode: destination.isoCode,
        name: destination.name,
        coordinates: { latitude: destination.latitude, longitude: destination.longitude },
      },
    };
  }

  async list(
    params: PaginationParams & { type?: MigrationRouteType; year?: number },
  ): Promise<{ items: RouteDTO[]; meta: PaginationMeta }> {
    const { items, total } = await this.migrationRepository.findAllRoutes(params);
    const dtos = (await Promise.all(items.map((route) => this.toRouteDTO(route)))).filter(
      (dto): dto is RouteDTO => dto !== null,
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

  async getById(id: string): Promise<RouteDTO> {
    const route = await this.migrationRepository.findRouteById(id);

    if (!route) {
      throw new NotFoundError('Rota migratória', id);
    }

    const dto = await this.toRouteDTO(route);

    if (!dto) {
      throw new NotFoundError('País de origem ou destino da rota', id);
    }

    return dto;
  }
}
