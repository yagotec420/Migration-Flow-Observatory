/**
 * Entidade de domínio: um retrato agregado de estatísticas para um
 * determinado escopo (global ou por país), consumido pelo dashboard.
 */
export interface StatisticsSnapshot {
  scope: 'global' | 'country';
  countryId?: string;
  totalOutbound: number;
  totalInbound: number;
  netBalance: number;
  topRoutes: Array<{ routeId: string; estimatedVolume: number }>;
  lastUpdated: string;
}
