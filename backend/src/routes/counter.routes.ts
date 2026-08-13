import { Router } from 'express';
import { CounterController } from '@/controllers/CounterController.js';
import { CounterService } from '@/services/CounterService.js';
import { CounterRepository } from '@/repositories/CounterRepository.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';

export function createCounterRouter(provider: IDataProvider): Router {
  const router = Router();
  const repository = new CounterRepository(provider);
  const service = new CounterService(repository);
  const controller = new CounterController(service);

  router.get('/counters', asyncHandler(controller.list));

  return router;
}
