/**
 * Contrato genérico que qualquer fonte de dados deve implementar.
 *
 * Hoje: `MockDataProvider` (src/providers/mock/MockDataProvider.ts).
 * Futuramente: um `PostgresDataProvider` poderá implementar exatamente
 * esta mesma interface usando Prisma internamente — sem que nenhuma
 * linha em `repositories/`, `services/` ou `controllers/` precise mudar.
 */
import type { Country } from '@/entities/Country.js';
import type { MigrationRoute } from '@/entities/MigrationRoute.js';
import type { MigrationFlow } from '@/entities/MigrationFlow.js';
import type { TimelineEntry } from '@/entities/TimelineEntry.js';

export interface IDataProvider {
  getCountries(): Promise<Country[]>;
  getCountryById(id: string): Promise<Country | null>;
  getRoutes(): Promise<MigrationRoute[]>;
  getRouteById(id: string): Promise<MigrationRoute | null>;
  getFlows(): Promise<MigrationFlow[]>;
  getTimeline(): Promise<TimelineEntry[]>;
}
