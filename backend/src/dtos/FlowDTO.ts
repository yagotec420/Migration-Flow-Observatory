import type { FlowDirection } from '@/entities/MigrationFlow.js';

export interface FlowDTO {
  id: string;
  countryId: string;
  countryName: string;
  direction: FlowDirection;
  period: {
    year: number;
    month: number;
  };
  estimatedPeople: number;
}
