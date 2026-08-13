import type { MigrationFlow } from '@/entities/MigrationFlow.js';

/**
 * Fluxos mensais agregados por país de origem/destino para o ano de
 * 2024, usados para compor timeline e estatísticas.
 */
export const mockFlows: MigrationFlow[] = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  const seasonalFactor = 1 + Math.sin(month / 2) * 0.2;

  return [
    {
      id: `f-ir-out-${month}`,
      countryId: 'c-ir',
      direction: 'outbound' as const,
      year: 2024,
      month,
      estimatedPeople: Math.round(8500 * seasonalFactor),
    },
    {
      id: `f-ir-in-${month}`,
      countryId: 'c-ir',
      direction: 'inbound' as const,
      year: 2024,
      month,
      estimatedPeople: Math.round(2100 * seasonalFactor),
    },
  ];
}).flat();
