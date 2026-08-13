import { env } from '@/config/env.js';

/**
 * Logger mínimo e estruturado. Isolado em um único ponto para que a
 * troca futura por uma solução mais robusta (ex: Pino + OpenTelemetry,
 * ver docs/project-decisions.md) não exija alterar chamadas espalhadas
 * pelo código — apenas a implementação deste módulo.
 */
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LEVEL_WEIGHT: Record<LogLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (LEVEL_WEIGHT[level] > LEVEL_WEIGHT[env.LOG_LEVEL]) {
    return;
  }

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  // eslint-disable-next-line no-console
  const writer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  writer(JSON.stringify(entry));
}

export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
};
