import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Envolve handlers assíncronos de Controllers para encaminhar
 * automaticamente qualquer rejeição de Promise ao errorHandler.middleware.ts,
 * evitando `try/catch` repetido em cada método de cada Controller.
 */
export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
