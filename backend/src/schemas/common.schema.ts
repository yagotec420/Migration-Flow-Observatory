import { z } from 'zod';

/**
 * Schemas reutilizáveis por múltiplos endpoints. Mantidos aqui para
 * nunca duplicar regras de paginação/ordenação/período entre os
 * schemas específicos de cada domínio.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'O identificador não pode ser vazio.'),
});
