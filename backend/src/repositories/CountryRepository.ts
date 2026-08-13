import type { ICountryRepository } from '@/interfaces/repositories/ICountryRepository.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import type { Country } from '@/entities/Country.js';
import type { PaginationParams } from '@/types/common.types.js';

/**
 * Repository de países. Depende exclusivamente da interface
 * `IDataProvider` — nunca de `MockDataProvider` diretamente — para
 * que a Etapa 3 possa injetar um `PostgresDataProvider` sem tocar
 * nesta classe.
 */
export class CountryRepository implements ICountryRepository {
  constructor(private readonly provider: IDataProvider) {}

  async findAll(
    params: PaginationParams & { region?: string },
  ): Promise<{ items: Country[]; total: number }> {
    const all = await this.provider.getCountries();
    const filtered = params.region
      ? all.filter((country) => country.region === params.region)
      : all;

    const start = (params.page - 1) * params.limit;
    const items = filtered.slice(start, start + params.limit);

    return { items, total: filtered.length };
  }

  async findById(id: string): Promise<Country | null> {
    return this.provider.getCountryById(id);
  }
}
