import { env } from '@/config/env.js';

export const serverConfig = {
  port: env.PORT,
  host: '0.0.0.0',
  gracefulShutdownTimeoutMs: 10_000,
} as const;
