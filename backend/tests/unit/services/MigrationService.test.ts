import { describe, it, expect } from 'vitest';
import { MigrationService } from '@/services/MigrationService.js';
import { MigrationRouteRepository } from '@/repositories/MigrationRouteRepository.js';
import { CountryRepository } from '@/repositories/CountryRepository.js';
import { MockDataProvider } from '@/providers/mock/MockDataProvider.js';

describe('MigrationService', () => {
  const provider = new MockDataProvider();
  const service = new MigrationService(
    new MigrationRouteRepository(provider),
    new CountryRepository(provider),
  );

  it('lista rotas paginadas com países enriquecidos', async () => {
    const { items, meta } = await service.list({ page: 1, limit: 5 });

    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(5);
    expect(meta.page).toBe(1);
    expect(items[0]).toHaveProperty('origin.name');
    expect(items[0]).toHaveProperty('destination.name');
  });

  it('filtra rotas por tipo', async () => {
    const { items } = await service.list({ page: 1, limit: 20, type: 'return' });
    expect(items.every((route) => route.type === 'return')).toBe(true);
  });

  it('lança NotFoundError para rota inexistente', async () => {
    await expect(service.getById('rota-inexistente')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
