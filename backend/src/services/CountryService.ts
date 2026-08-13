import type { ICountryRepository } from '@/interfaces/repositories/ICountryRepository.js';
import type { CountryDTO } from '@/dtos/CountryDTO.js';
import type { PaginationParams, PaginationMeta } from '@/types/common.types.js';
import { NotFoundError } from '@/errors/NotFoundError.js';

function toCountryDTO(country: {
  id: string;
  isoCode: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
}): CountryDTO {
  return {
    id: country.id,
    isoCode: country.isoCode,
    name: country.name,
    coordinates: { latitude: country.latitude, longitude: country.longitude },
    region: country.region,
  };
}

export class CountryService {
  constructor(private readonly countryRepository: ICountryRepository) {}

  async list(
    params: PaginationParams & { region?: string },
  ): Promise<{ items: CountryDTO[]; meta: PaginationMeta }> {
    const { items, total } = await this.countryRepository.findAll(params);

    return {
      items: items.map(toCountryDTO),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.limit)),
      },
    };
  }

  async getById(id: string): Promise<CountryDTO> {
    const country = await this.countryRepository.findById(id);

    if (!country) {
      throw new NotFoundError('País', id);
    }

    return toCountryDTO(country);
  }
}
