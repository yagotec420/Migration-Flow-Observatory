import type {
  ICounterRepository,
  CounterRaw,
} from '@/interfaces/repositories/ICounterRepository.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';

export class CounterRepository implements ICounterRepository {
  constructor(private readonly provider: IDataProvider) {}

  async getCounters(): Promise<CounterRaw[]> {
    const [countries, routes, flows] = await Promise.all([
      this.provider.getCountries(),
      this.provider.getRoutes(),
      this.provider.getFlows(),
    ]);

    const totalPeople = flows.reduce((sum, flow) => sum + flow.estimatedPeople, 0);

    return [
      { label: 'Países monitorados', value: countries.length, unit: 'countries' },
      { label: 'Rotas migratórias mapeadas', value: routes.length, unit: 'routes' },
      { label: 'Pessoas estimadas nos fluxos', value: totalPeople, unit: 'people' },
    ];
  }
}
