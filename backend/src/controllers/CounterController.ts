import type { Request, Response } from 'express';
import type { CounterService } from '@/services/CounterService.js';
import { sendSuccess } from '@/utils/apiResponse.js';

export class CounterController {
  constructor(private readonly counterService: CounterService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const counters = await this.counterService.list();
    sendSuccess(res, counters);
  };
}
