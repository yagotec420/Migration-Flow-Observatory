import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Injeta um ID único por requisição (usado nos logs e devolvido no
 * header `X-Request-Id`), essencial para rastrear uma requisição
 * específica em ambiente de produção — preparação direta para a
 * futura integração com OpenTelemetry (ver docs/project-decisions.md).
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('X-Request-Id');
  req.requestId = incoming ?? uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}
