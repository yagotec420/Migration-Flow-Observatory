/**
 * Entidade de domínio: representa um país participante de fluxos
 * migratórios (origem, destino ou trânsito).
 */
export interface Country {
  id: string;
  isoCode: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
}
