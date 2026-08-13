import morgan from 'morgan';
import type { Request } from 'express';
import { env } from '@/config/env.js';

morgan.token('request-id', (req: Request) => req.requestId);

const format = env.isProduction
  ? ':request-id :method :url :status :res[content-length] - :response-time ms'
  : ':request-id :method :url :status :response-time ms - :res[content-length]b';

export const requestLogger = morgan(format, {
  skip: () => env.isTest,
});
