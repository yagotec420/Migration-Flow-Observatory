import { ErrorCode, type ErrorCodeType } from '@/constants/errorCodes.js';
import { HttpStatus, type HttpStatusCode } from '@/constants/httpStatus.js';

/**
 * Classe base para todos os erros de domínio/aplicação da API.
 *
 * Nunca lance `Error` genérico dentro de Controllers ou Services —
 * sempre uma subclasse de AppError, para que o errorHandler.middleware.ts
 * saiba exatamente qual status HTTP e código de erro retornar,
 * sem nunca expor stack trace ao cliente.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCodeType;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCodeType = ErrorCode.INTERNAL_ERROR,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
