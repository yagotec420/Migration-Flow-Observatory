import type { Response } from 'express';
import { appConfig } from '@/config/app.config.js';
import { HttpStatus, type HttpStatusCode } from '@/constants/httpStatus.js';
import type { ErrorCodeType } from '@/constants/errorCodes.js';

/**
 * Constrói o envelope de resposta padrão da API — usado por TODOS os
 * Controllers, garantindo o mesmo formato em qualquer endpoint:
 *
 * { success, data, meta, timestamp, version }
 * { success, error: { code, message } }
 */
export function sendSuccess<T, TMeta extends object = Record<string, never>>(
  res: Response,
  data: T,
  meta: TMeta = {} as TMeta,
  statusCode: HttpStatusCode = HttpStatus.OK,
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
    version: appConfig.version,
  });
}

export function sendError(
  res: Response,
  statusCode: HttpStatusCode,
  code: ErrorCodeType,
  message: string,
  details?: unknown,
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
    version: appConfig.version,
  });
}
