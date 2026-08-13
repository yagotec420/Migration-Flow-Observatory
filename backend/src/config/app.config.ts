import { API_PREFIX, API_VERSION } from '@/constants/apiVersion.js';

/**
 * Metadados da aplicação, usados por ex. no endpoint /health e no
 * campo `meta.version` do padrão de resposta da API.
 */
export const appConfig = {
  name: 'Migration Flow Observatory API',
  version: API_VERSION,
  apiPrefix: API_PREFIX,
  description:
    'API de dados simulados/estimados sobre fluxos migratórios — projeto educacional de portfólio.',
} as const;
