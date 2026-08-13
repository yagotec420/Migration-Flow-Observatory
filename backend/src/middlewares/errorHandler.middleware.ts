import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/errors/AppError.js';
import { sendError } from '@/utils/apiResponse.js';
import { HttpStatus } from '@/constants/httpStatus.js';
import { ErrorCode } from '@/constants/errorCodes.js';
import { logger } from '@/utils/logger.js';

/**
 * Middleware de erro centralizado — ÚNICO ponto do backend que decide
 * o que é exposto ao cliente. Nunca vaza stack trace. Erros
 * conhecidos (AppError e subclasses) retornam seu próprio status/code;
 * qualquer outro erro é tratado como falha interna genérica.
 *
 * Precisa dos 4 parâmetros (incluindo `_next`) para o Express
 * reconhecer esta função como error-handling middleware.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn(err.message, { requestId: req.requestId, code: err.code, details: err.details });
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  logger.error('Erro não tratado', {
    requestId: req.requestId,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  sendError(
    res,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_ERROR,
    'Ocorreu um erro inesperado ao processar a requisição.',
  );
}
