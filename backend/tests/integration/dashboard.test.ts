import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '@/api/app.js';

describe('GET /api/v1/dashboard', () => {
  const app = createApp();

  it('retorna counters, statistics, timeline e rotas em destaque', async () => {
    const response = await request(app).get('/api/v1/dashboard');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('counters');
    expect(response.body.data).toHaveProperty('statistics');
    expect(response.body.data).toHaveProperty('recentTimeline');
    expect(response.body.data).toHaveProperty('highlightedRoutes');
  });
});
