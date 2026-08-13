import { z } from 'zod';
import { dateRangeQuerySchema } from '@/schemas/common.schema.js';

export const timelineQuerySchema = dateRangeQuerySchema.extend({
  countryId: z.string().optional(),
  granularity: z.enum(['month', 'year']).default('month'),
});
