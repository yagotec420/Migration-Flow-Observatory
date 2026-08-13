import { beforeAll } from 'vitest';

/**
 * Setup global do Vitest. Garante variáveis de ambiente mínimas antes
 * de qualquer teste que importe `src/config/env.ts`.
 */
beforeAll(() => {
  process.env.NODE_ENV = 'test';
});
