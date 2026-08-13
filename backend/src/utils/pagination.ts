import type { PaginationParams } from '@/types/common.types.js';

/**
 * Normaliza parâmetros de paginação já validados pelo Zod, garantindo
 * um contrato único consumido por todos os Repositories.
 */
export function normalizePagination(query: { page?: number; limit?: number }): PaginationParams {
  return {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
  };
}
