import type { MigrationRouteType } from '@/entities/MigrationRoute.js';

export interface RouteDTO {
  id: string;
  type: MigrationRouteType;
  year: number;
  estimatedVolume: number;
  origin: {
    countryId: string;
    isoCode: string;
    name: string;
    coordinates: { latitude: number; longitude: number };
  };
  destination: {
    countryId: string;
    isoCode: string;
    name: string;
    coordinates: { latitude: number; longitude: number };
  };
}
