import { Router } from 'express';
import { StatisticsController } from '@/controllers/StatisticsController.js';
import { StatisticsService } from '@/services/StatisticsService.js';
import { StatisticsRepository } from '@/repositories/StatisticsRepository.js';
import { validateRequest } from '@/validators/validateRequest.js';
import { statisticsQuerySchema } from '@/schemas/statistics.schema.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';

export function createStatisticsRouter(provider: IDataProvider): Router {
  const router = Router();
  const repository = new StatisticsRepository(provider);
  const service = new StatisticsService(repository);
  const controller = new StatisticsController(service);

  router.get(
    '/statistics',
    validateRequest(statisticsQuerySchema, 'query'),
    asyncHandler(controller.get),
  );

  return router;
}
