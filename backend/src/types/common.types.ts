/**
 * Tipos utilitários compartilhados entre camadas. Não confundir com
 * `entities/` (modelos de domínio) nem `dtos/` (contratos de I/O):
 * este arquivo guarda apenas tipos estruturais genéricos.
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams<TField extends string = string> {
  sortBy?: TField;
  order?: SortOrder;
}
