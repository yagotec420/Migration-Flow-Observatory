import { Router } from 'express';
import { RouteController } from '@/controllers/RouteController.js';
import { MigrationService } from '@/services/MigrationService.js';
import { MigrationRouteRepository } from '@/repositories/MigrationRouteRepository.js';
import { CountryRepository } from '@/repositories/CountryRepository.js';
import { validateRequest } from '@/validators/validateRequest.js';
import { listRoutesQuerySchema, routeIdParamSchema } from '@/schemas/route.schema.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';

export function createRouteRouter(provider: IDataProvider): Router {
  const router = Router();
  const migrationRepository = new MigrationRouteRepository(provider);
  const countryRepository = new CountryRepository(provider);
  const service = new MigrationService(migrationRepository, countryRepository);
  const controller = new RouteController(service);

  router.get('/routes', validateRequest(listRoutesQuerySchema, 'query'), asyncHandler(controller.list));
  router.get(
    '/routes/:id',
    validateRequest(routeIdParamSchema, 'params'),
    asyncHandler(controller.getById),
  );

  return router;
}
