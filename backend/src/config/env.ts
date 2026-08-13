import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

/**
 * Schema de validação das variáveis de ambiente. A aplicação falha
 * rápido (fail-fast) na inicialização se algo obrigatório estiver
 * ausente ou em formato inválido, em vez de falhar silenciosamente
 * em algum request no meio da produção.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  API_VERSION: z.string().default('v1'),
  DATABASE_URL: z.string().optional(),
  MAPBOX_TOKEN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Falha ao carregar variáveis de ambiente. Verifique o arquivo .env.');
}

export const env = {
  ...parsed.data,
  CORS_ALLOWED_ORIGINS_LIST: parsed.data.CORS_ALLOWED_ORIGINS.split(',').map((origin) =>
    origin.trim(),
  ),
  isProduction: parsed.data.NODE_ENV === 'production',
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
};
