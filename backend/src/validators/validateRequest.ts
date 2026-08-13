import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '@/errors/ValidationError.js';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Middleware factory: recebe um schema Zod e a parte da requisição a
 * validar, e devolve um middleware Express pronto para uso em rotas.
 *
 * Uso: router.get('/countries', validateRequest(listCountriesQuerySchema, 'query'), controller.list)
 *
 * Em caso de sucesso, a parte validada da requisição é substituída
 * pelo resultado parseado do Zod (com defaults e coerções aplicados),
 * garantindo que o Controller sempre receba dados já normalizados.
 */
export function validateRequest(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const details = result.error.flatten();
      next(new ValidationError(`Dados inválidos em "${part}" da requisição.`, details));
      return;
    }

    // Substitui pelos dados normalizados (com defaults/coerções do Zod aplicados).
    (req[part] as unknown) = result.data;
    next();
  };
}
