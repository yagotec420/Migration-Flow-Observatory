/**
 * Entidade de domínio: uma rota migratória entre dois países,
 * usada para desenhar as animações de fluxo no mapa do frontend.
 */
export type MigrationRouteType = 'departure' | 'return' | 'transit';

export interface MigrationRoute {
  id: string;
  originCountryId: string;
  destinationCountryId: string;
  type: MigrationRouteType;
  estimatedVolume: number;
  year: number;
}
