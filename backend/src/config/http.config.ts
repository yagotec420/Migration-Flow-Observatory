import { env } from '@/config/env.js';

/**
 * Configurações puras (sem lógica de wiring) consumidas pelos
 * middlewares de segurança/performance em `middlewares/security.middleware.ts`
 * e `middlewares/rateLimit.middleware.ts`. Mantidas separadas para que
 * os valores possam ser ajustados sem tocar na lógica de montagem do Express.
 */
export const corsConfig = {
  origin: env.CORS_ALLOWED_ORIGINS_LIST,
  credentials: true,
};

export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
};

export const compressionConfig = {
  threshold: 1024,
};
