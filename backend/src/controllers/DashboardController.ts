import type { Request, Response } from 'express';
import type { DashboardService } from '@/services/DashboardService.js';
import { sendSuccess } from '@/utils/apiResponse.js';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  get = async (_req: Request, res: Response): Promise<void> => {
    const summary = await this.dashboardService.getSummary();
    sendSuccess(res, summary);
  };
}
