import type { Country } from '@/entities/Country.js';
import type { PaginationParams } from '@/types/common.types.js';

export interface ICountryRepository {
  findAll(params: PaginationParams & { region?: string }): Promise<{
    items: Country[];
    total: number;
  }>;
  findById(id: string): Promise<Country | null>;
}
