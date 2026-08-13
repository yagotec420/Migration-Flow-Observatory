import { Router } from 'express';
import { FlowController } from '@/controllers/FlowController.js';
import { FlowService } from '@/services/FlowService.js';
import { FlowRepository } from '@/repositories/FlowRepository.js';
import { CountryRepository } from '@/repositories/CountryRepository.js';
import { validateRequest } from '@/validators/validateRequest.js';
import { listFlowsQuerySchema } from '@/schemas/flow.schema.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';

export function createFlowRouter(provider: IDataProvider): Router {
  const router = Router();
  const flowRepository = new FlowRepository(provider);
  const countryRepository = new CountryRepository(provider);
  const service = new FlowService(flowRepository, countryRepository);
  const controller = new FlowController(service);

  router.get('/flows', validateRequest(listFlowsQuerySchema, 'query'), asyncHandler(controller.list));

  return router;
}
