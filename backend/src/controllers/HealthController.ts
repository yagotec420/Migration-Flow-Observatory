import type { Request, Response } from 'express';
import { sendSuccess } from '@/utils/apiResponse.js';
import { appConfig } from '@/config/app.config.js';

export class HealthController {
  check(_req: Request, res: Response): void {
    sendSuccess(res, {
      status: 'ok',
      service: appConfig.name,
      version: appConfig.version,
      uptimeSeconds: process.uptime(),
    });
  }
}
