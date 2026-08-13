import { z } from 'zod';
import { paginationQuerySchema } from '@/schemas/common.schema.js';
import { idParamSchema } from '@/schemas/common.schema.js';

export const listCountriesQuerySchema = paginationQuerySchema.extend({
  region: z.string().optional(),
});

export const countryIdParamSchema = idParamSchema;
