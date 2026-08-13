/**
 * Códigos de erro estáveis, consumidos pelo frontend para tratamento
 * programático (nunca dependa apenas da mensagem, que pode mudar).
 */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
