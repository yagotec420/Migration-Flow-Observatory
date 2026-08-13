import { z } from 'zod';
import { paginationQuerySchema, dateRangeQuerySchema } from '@/schemas/common.schema.js';

export const listFlowsQuerySchema = paginationQuerySchema.merge(dateRangeQuerySchema).extend({
  countryId: z.string().optional(),
  direction: z.enum(['outbound', 'inbound']).optional(),
});
