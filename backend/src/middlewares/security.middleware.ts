import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { corsConfig, compressionConfig } from '@/config/http.config.js';

/**
 * Agrupa o wiring de segurança/performance (Helmet, CORS, Compression).
 * Os valores concretos ficam em config/http.config.ts — este arquivo
 * apenas monta os middlewares do Express com esses valores.
 */
export const securityMiddlewares = [helmet(), cors(corsConfig), compression(compressionConfig)];
