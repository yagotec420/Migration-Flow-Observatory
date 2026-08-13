import type { Request, Response } from 'express';
import type { CountryService } from '@/services/CountryService.js';
import { sendSuccess } from '@/utils/apiResponse.js';
import { normalizePagination } from '@/utils/pagination.js';

export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as { page: number; limit: number; region?: string };
    const { items, meta } = await this.countryService.list({
      ...normalizePagination(query),
      region: query.region,
    });
    sendSuccess(res, items, meta);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const country = await this.countryService.getById(id);
    sendSuccess(res, country);
  };
}
