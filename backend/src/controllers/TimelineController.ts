import type { Request, Response } from 'express';
import type { TimelineService } from '@/services/TimelineService.js';
import { sendSuccess } from '@/utils/apiResponse.js';

export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as {
      countryId?: string;
      granularity: 'month' | 'year';
      startDate?: string;
      endDate?: string;
    };
    const timeline = await this.timelineService.list(query);
    sendSuccess(res, timeline);
  };
}
