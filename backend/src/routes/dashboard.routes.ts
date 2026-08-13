import { Router } from 'express';
import { DashboardController } from '@/controllers/DashboardController.js';
import { DashboardService } from '@/services/DashboardService.js';
import { CounterService } from '@/services/CounterService.js';
import { StatisticsService } from '@/services/StatisticsService.js';
import { TimelineService } from '@/services/TimelineService.js';
import { MigrationService } from '@/services/MigrationService.js';
import { CounterRepository } from '@/repositories/CounterRepository.js';
import { StatisticsRepository } from '@/repositories/StatisticsRepository.js';
import { TimelineRepository } from '@/repositories/TimelineRepository.js';
import { MigrationRouteRepository } from '@/repositories/MigrationRouteRepository.js';
import { CountryRepository } from '@/repositories/CountryRepository.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import type { IDataProvider } from '@/interfaces/providers/IDataProvider.js';

export function createDashboardRouter(provider: IDataProvider): Router {
  const router = Router();

  const counterService = new CounterService(new CounterRepository(provider));
  const statisticsService = new StatisticsService(new StatisticsRepository(provider));
  const timelineService = new TimelineService(new TimelineRepository(provider));
  const migrationService = new MigrationService(
    new MigrationRouteRepository(provider),
    new CountryRepository(provider),
  );

  const service = new DashboardService(
    counterService,
    statisticsService,
    timelineService,
    migrationService,
  );
  const controller = new DashboardController(service);

  router.get('/dashboard', asyncHandler(controller.get));

  return router;
}
