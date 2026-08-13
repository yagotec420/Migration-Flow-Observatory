import type { MigrationRoute } from '@/entities/MigrationRoute.js';

export const mockRoutes: MigrationRoute[] = [
  { id: 'r-1', originCountryId: 'c-ir', destinationCountryId: 'c-tr', type: 'departure', estimatedVolume: 42000, year: 2024 },
  { id: 'r-2', originCountryId: 'c-ir', destinationCountryId: 'c-de', type: 'departure', estimatedVolume: 18500, year: 2024 },
  { id: 'r-3', originCountryId: 'c-ir', destinationCountryId: 'c-ae', type: 'departure', estimatedVolume: 26000, year: 2024 },
  { id: 'r-4', originCountryId: 'c-ir', destinationCountryId: 'c-ca', type: 'departure', estimatedVolume: 9500, year: 2024 },
  { id: 'r-5', originCountryId: 'c-ir', destinationCountryId: 'c-us', type: 'departure', estimatedVolume: 7200, year: 2024 },
  { id: 'r-6', originCountryId: 'c-ir', destinationCountryId: 'c-se', type: 'departure', estimatedVolume: 5100, year: 2024 },
  { id: 'r-7', originCountryId: 'c-tr', destinationCountryId: 'c-ir', type: 'return', estimatedVolume: 11800, year: 2024 },
  { id: 'r-8', originCountryId: 'c-de', destinationCountryId: 'c-ir', type: 'return', estimatedVolume: 3600, year: 2024 },
  { id: 'r-9', originCountryId: 'c-iq', destinationCountryId: 'c-ir', type: 'transit', estimatedVolume: 4200, year: 2024 },
  { id: 'r-10', originCountryId: 'c-af', destinationCountryId: 'c-ir', type: 'transit', estimatedVolume: 15600, year: 2024 },
  { id: 'r-11', originCountryId: 'c-ir', destinationCountryId: 'c-tr', type: 'departure', estimatedVolume: 39000, year: 2023 },
  { id: 'r-12', originCountryId: 'c-ir', destinationCountryId: 'c-de', type: 'departure', estimatedVolume: 16200, year: 2023 },
];
