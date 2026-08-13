import type { Request, Response } from 'express';
import type { StatisticsService } from '@/services/StatisticsService.js';
import { sendSuccess } from '@/utils/apiResponse.js';

export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const { countryId } = req.query as { countryId?: string };
    const statistics = await this.statisticsService.getSnapshot(countryId);
    sendSuccess(res, statistics);
  };
}
