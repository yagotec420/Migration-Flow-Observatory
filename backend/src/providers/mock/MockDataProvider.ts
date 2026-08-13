import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import type { Country } from '@/entities/Country.js';
import type { MigrationRoute } from '@/entities/MigrationRoute.js';
import type { MigrationFlow } from '@/entities/MigrationFlow.js';
import type { TimelineEntry } from '@/entities/TimelineEntry.js';
import { mockCountries } from '@/providers/mock/data/countries.mock.js';
import { mockRoutes } from '@/providers/mock/data/routes.mock.js';
import { mockFlows } from '@/providers/mock/data/flows.mock.js';

/**
 * Implementação de IDataProvider sobre dados em memória (arrays
 * mockados). É a ÚNICA classe do projeto que conhece o formato bruto
 * dos arquivos `*.mock.ts` — nenhum Controller, Service ou Repository
 * importa esses arquivos diretamente.
 *
 * Quando a Etapa 3 (Banco de Dados) estiver pronta, um
 * `PostgresDataProvider implements IDataProvider` poderá ser criado
 * e trocado aqui via injeção de dependência (ver `src/api/app.ts`),
 * sem qualquer alteração em Repository, Service, Controller ou Route.
 */
export class MockDataProvider implements IDataProvider {
  async getCountries(): Promise<Country[]> {
    return mockCountries;
  }

  async getCountryById(id: string): Promise<Country | null> {
    return mockCountries.find((country) => country.id === id) ?? null;
  }

  async getRoutes(): Promise<MigrationRoute[]> {
    return mockRoutes;
  }

  async getRouteById(id: string): Promise<MigrationRoute | null> {
    return mockRoutes.find((route) => route.id === id) ?? null;
  }

  async getFlows(): Promise<MigrationFlow[]> {
    return mockFlows;
  }

  async getTimeline(): Promise<TimelineEntry[]> {
    const grouped = new Map<string, TimelineEntry>();

    for (const flow of mockFlows) {
      const key = `${flow.year}-${flow.month}`;
      const existing = grouped.get(key) ?? {
        year: flow.year,
        month: flow.month,
        outbound: 0,
        inbound: 0,
        netBalance: 0,
      };

      if (flow.direction === 'outbound') {
        existing.outbound += flow.estimatedPeople;
      } else {
        existing.inbound += flow.estimatedPeople;
      }

      existing.netBalance = existing.inbound - existing.outbound;
      grouped.set(key, existing);
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month,
    );
  }
}
