import 'express';

/**
 * Extensão do tipo Request do Express para incluir campos injetados
 * pelos nossos próprios middlewares (ex: requestId.middleware.ts).
 * Mantido em `types/` — nunca dentro de `middlewares/` — para que
 * qualquer camada possa importar o tipo sem importar lógica.
 */
declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
  }
}
