import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '@/api/app.js';

describe('GET /health', () => {
  const app = createApp();

  it('retorna status ok com o envelope padrão de resposta', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });
});
