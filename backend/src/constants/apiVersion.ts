/**
 * Versão da API exposta em `meta.version` de toda resposta e usada
 * como prefixo de rota (`/api/v1`). Centralizado para que uma futura
 * v2 não exija busca-e-substituição espalhada pelo código.
 */
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;
