export interface StatisticsDTO {
  scope: 'global' | 'country';
  countryId?: string;
  totals: {
    outbound: number;
    inbound: number;
    netBalance: number;
  };
  topRoutes: Array<{ routeId: string; estimatedVolume: number }>;
  lastUpdated: string;
}
