import express, { type Express } from 'express';
import { securityMiddlewares } from '@/middlewares/security.middleware.js';
import { rateLimiter } from '@/middlewares/rateLimit.middleware.js';
import { requestId } from '@/middlewares/requestId.middleware.js';
import { requestLogger } from '@/middlewares/logger.middleware.js';
import { notFoundHandler } from '@/middlewares/notFound.middleware.js';
import { errorHandler } from '@/middlewares/errorHandler.middleware.js';
import { createApiRouter, healthRouter } from '@/routes/index.js';
import { appConfig } from '@/config/app.config.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import { MockDataProvider } from '@/providers/mock/MockDataProvider.js';

/**
 * Ponto único de montagem do Express. É aqui — e SOMENTE aqui — que a
 * implementação concreta do provider é escolhida e injetada em toda a
 * árvore de rotas/repositories/services.
 *
 * Quando a Etapa 3 (Banco de Dados) estiver pronta, a troca para
 * PostgreSQL será:
 *
 *   const provider: IDataProvider = env.DATABASE_URL
 *     ? new PostgresDataProvider()
 *     : new MockDataProvider();
 *
 * Nenhuma outra linha do backend precisa mudar.
 */
export function createApp(provider: IDataProvider = new MockDataProvider()): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestId);
  app.use(...securityMiddlewares);
  app.use(requestLogger);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimiter);

  app.use('/health', healthRouter);
  app.use(appConfig.apiPrefix, createApiRouter(provider));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
