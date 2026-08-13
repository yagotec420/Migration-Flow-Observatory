import { AppError } from '@/errors/AppError.js';
import { ErrorCode } from '@/constants/errorCodes.js';
import { HttpStatus } from '@/constants/httpStatus.js';

/**
 * Usado para erros inesperados (bugs, falhas de infraestrutura).
 * A mensagem exposta ao cliente é sempre genérica; o detalhe real
 * vai apenas para o log do servidor (ver utils/logger.ts).
 */
export class InternalServerError extends AppError {
  constructor(originalError?: unknown) {
    super(
      'Ocorreu um erro inesperado ao processar a requisição.',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR,
      undefined,
    );
    this.cause = originalError;
  }
}
