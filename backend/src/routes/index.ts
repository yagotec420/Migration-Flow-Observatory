import { Router } from 'express';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';
import healthRouter from '@/routes/health.routes.js';
import { createCountryRouter } from '@/routes/country.routes.js';
import { createRouteRouter } from '@/routes/route.routes.js';
import { createFlowRouter } from '@/routes/flow.routes.js';
import { createTimelineRouter } from '@/routes/timeline.routes.js';
import { createStatisticsRouter } from '@/routes/statistics.routes.js';
import { createCounterRouter } from '@/routes/counter.routes.js';
import { createDashboardRouter } from '@/routes/dashboard.routes.js';

/**
 * Agregador único de rotas. `src/api/app.ts` monta este router sob o
 * prefixo `/api/v1` (ver constants/apiVersion.ts). `/health` é
 * montado fora do prefixo de versão, por convenção de orquestradores
 * (Kubernetes, load balancers) que esperam esse caminho fixo.
 */
export function createApiRouter(provider: IDataProvider): Router {
  const router = Router();

  router.use(createCountryRouter(provider));
  router.use(createRouteRouter(provider));
  router.use(createFlowRouter(provider));
  router.use(createTimelineRouter(provider));
  router.use(createStatisticsRouter(provider));
  router.use(createCounterRouter(provider));
  router.use(createDashboardRouter(provider));

  return router;
}

export { healthRouter };
