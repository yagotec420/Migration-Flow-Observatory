import type { Request, Response } from 'express';
import { sendError } from '@/utils/apiResponse.js';
import { HttpStatus } from '@/constants/httpStatus.js';
import { ErrorCode } from '@/constants/errorCodes.js';

/**
 * Middleware de "catch-all" para rotas inexistentes. Diferente de
 * NotFoundError (usado quando um RECURSO não existe, ex: país com ID
 * inválido), este middleware trata rotas/endpoints que não existem.
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    HttpStatus.NOT_FOUND,
    ErrorCode.NOT_FOUND,
    `Rota "${req.method} ${req.originalUrl}" não existe nesta API.`,
  );
}
