import type { Request, Response } from 'express';
import type { MigrationService } from '@/services/MigrationService.js';
import { sendSuccess } from '@/utils/apiResponse.js';
import { normalizePagination } from '@/utils/pagination.js';
import type { MigrationRouteType } from '@/entities/MigrationRoute.js';

export class RouteController {
  constructor(private readonly migrationService: MigrationService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      type?: MigrationRouteType;
      year?: number;
    };
    const { items, meta } = await this.migrationService.list({
      ...normalizePagination(query),
      type: query.type,
      year: query.year,
    });
    sendSuccess(res, items, meta);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const route = await this.migrationService.getById(id);
    sendSuccess(res, route);
  };
}
