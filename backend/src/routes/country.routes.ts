import { Router } from 'express';
import { CountryController } from '@/controllers/CountryController.js';
import { CountryService } from '@/services/CountryService.js';
import { CountryRepository } from '@/repositories/CountryRepository.js';
import { validateRequest } from '@/validators/validateRequest.js';
import { listCountriesQuerySchema, countryIdParamSchema } from '@/schemas/country.schema.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';

/**
 * Cada módulo de rotas recebe o `provider` via injeção de dependência
 * (ver src/api/app.ts) e monta sua própria cadeia
 * Repository → Service → Controller, mantendo o roteador
 * autocontido e testável isoladamente.
 */
export function createCountryRouter(provider: IDataProvider): Router {
  const router = Router();
  const repository = new CountryRepository(provider);
  const service = new CountryService(repository);
  const controller = new CountryController(service);

  router.get('/countries', validateRequest(listCountriesQuerySchema, 'query'), asyncHandler(controller.list));
  router.get(
    '/countries/:id',
    validateRequest(countryIdParamSchema, 'params'),
    asyncHandler(controller.getById),
  );

  return router;
}
