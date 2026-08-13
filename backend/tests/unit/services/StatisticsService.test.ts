import { describe, it, expect } from 'vitest';
import { StatisticsService } from '@/services/StatisticsService.js';
import { StatisticsRepository } from '@/repositories/StatisticsRepository.js';
import { MockDataProvider } from '@/providers/mock/MockDataProvider.js';

describe('StatisticsService', () => {
  const provider = new MockDataProvider();
  const service = new StatisticsService(new StatisticsRepository(provider));

  it('retorna snapshot global quando nenhum país é informado', async () => {
    const snapshot = await service.getSnapshot();
    expect(snapshot.scope).toBe('global');
    expect(snapshot.totals.outbound).toBeGreaterThan(0);
  });

  it('retorna snapshot escopado por país', async () => {
    const snapshot = await service.getSnapshot('c-ir');
    expect(snapshot.scope).toBe('country');
    expect(snapshot.countryId).toBe('c-ir');
  });
});
