import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '@/api/app.js';

describe('Rotas inexistentes', () => {
  const app = createApp();

  it('retorna 404 com o envelope de erro padrão para endpoint inexistente', async () => {
    const response = await request(app).get('/api/v1/rota-que-nao-existe');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
