import { createApp } from '@/api/app.js';
import { serverConfig } from '@/config/server.config.js';
import { appConfig } from '@/config/app.config.js';
import { logger } from '@/utils/logger.js';

const app = createApp();

const server = app.listen(serverConfig.port, serverConfig.host, () => {
  logger.info(`${appConfig.name} rodando`, {
    port: serverConfig.port,
    apiPrefix: appConfig.apiPrefix,
    healthCheck: `http://localhost:${serverConfig.port}/health`,
  });
});

/**
 * Encerramento gracioso: para de aceitar novas conexões e aguarda as
 * requisições em andamento terminarem antes de finalizar o processo.
 * Preparação direta para deploy em orquestradores (Etapa v4).
 */
function gracefulShutdown(signal: string): void {
  logger.info(`Sinal ${signal} recebido, encerrando servidor graciosamente...`);

  const forceExitTimeout = setTimeout(() => {
    logger.error('Encerramento forçado após timeout.');
    process.exit(1);
  }, serverConfig.gracefulShutdownTimeoutMs);

  server.close((err) => {
    clearTimeout(forceExitTimeout);
    if (err) {
      logger.error('Erro ao encerrar servidor', { error: err.message });
      process.exit(1);
    }
    logger.info('Servidor encerrado com sucesso.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: String(reason) });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
