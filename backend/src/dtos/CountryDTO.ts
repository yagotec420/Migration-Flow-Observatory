/**
 * DTO de saída para /countries. Nunca retornamos a entidade `Country`
 * diretamente — o DTO é o contrato público e estável da API,
 * desacoplado dos detalhes internos da entidade de domínio.
 */
export interface CountryDTO {
  id: string;
  isoCode: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  region: string;
}
