import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '@/api/app.js';

describe('GET /api/v1/routes', () => {
  const app = createApp();

  it('lista rotas paginadas', async () => {
    const response = await request(app).get('/api/v1/routes?page=1&limit=3');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeLessThanOrEqual(3);
    expect(response.body.meta).toMatchObject({ page: 1, limit: 3 });
  });

  it('retorna 400 para query inválida', async () => {
    const response = await request(app).get('/api/v1/routes?limit=9999');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 404 para rota inexistente', async () => {
    const response = await request(app).get('/api/v1/routes/nao-existe');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
