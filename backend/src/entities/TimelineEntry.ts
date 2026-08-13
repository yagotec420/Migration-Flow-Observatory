/**
 * Entidade de domínio: um ponto na linha do tempo agregando o saldo
 * migratório (entradas - saídas) de um período.
 */
export interface TimelineEntry {
  year: number;
  month: number;
  outbound: number;
  inbound: number;
  netBalance: number;
}
