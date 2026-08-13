import { z } from 'zod';
import { paginationQuerySchema, idParamSchema } from '@/schemas/common.schema.js';

export const listRoutesQuerySchema = paginationQuerySchema.extend({
  type: z.enum(['departure', 'return', 'transit']).optional(),
  year: z.coerce.number().int().optional(),
});

export const routeIdParamSchema = idParamSchema;
