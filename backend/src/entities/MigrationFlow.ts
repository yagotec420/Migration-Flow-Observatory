/**
 * Entidade de domínio: um registro agregado de fluxo migratório em
 * um determinado período (mês/ano), usado para estatísticas e timeline.
 */
export type FlowDirection = 'outbound' | 'inbound';

export interface MigrationFlow {
  id: string;
  countryId: string;
  direction: FlowDirection;
  year: number;
  month: number;
  estimatedPeople: number;
}
