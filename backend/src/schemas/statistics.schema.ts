import { z } from 'zod';

export const statisticsQuerySchema = z.object({
  countryId: z.string().optional(),
});
