import { Router } from 'express';
import { TimelineController } from '@/controllers/TimelineController.js';
import { TimelineService } from '@/services/TimelineService.js';
import { TimelineRepository } from '@/repositories/TimelineRepository.js';
import { validateRequest } from '@/validators/validateRequest.js';
import { timelineQuerySchema } from '@/schemas/timeline.schema.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';

export function createTimelineRouter(provider: IDataProvider): Router {
  const router = Router();
  const repository = new TimelineRepository(provider);
  const service = new TimelineService(repository);
  const controller = new TimelineController(service);

  router.get('/timeline', validateRequest(timelineQuerySchema, 'query'), asyncHandler(controller.list));

  return router;
}
