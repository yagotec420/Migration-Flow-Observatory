import type { Request, Response } from 'express';
import type { FlowService } from '@/services/FlowService.js';
import { sendSuccess } from '@/utils/apiResponse.js';
import { normalizePagination } from '@/utils/pagination.js';
import type { FlowDirection } from '@/entities/MigrationFlow.js';

export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      countryId?: string;
      direction?: FlowDirection;
      startDate?: string;
      endDate?: string;
    };
    const { items, meta } = await this.flowService.list({
      ...normalizePagination(query),
      countryId: query.countryId,
      direction: query.direction,
      startDate: query.startDate,
      endDate: query.endDate,
    });
    sendSuccess(res, items, meta);
  };
}
