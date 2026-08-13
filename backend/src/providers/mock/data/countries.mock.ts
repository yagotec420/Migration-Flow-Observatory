import type { Country } from '@/entities/Country.js';

/**
 * Dados simulados. Coordenadas aproximadas de capitais/centros,
 * suficientes para plotagem no mapa do frontend (v1). Não representam
 * fonte oficial — ver aviso em docs/architecture.md e no README raiz.
 */
export const mockCountries: Country[] = [
  { id: 'c-ir', isoCode: 'IR', name: 'Irã', latitude: 35.6892, longitude: 51.389, region: 'Middle East' },
  { id: 'c-tr', isoCode: 'TR', name: 'Turquia', latitude: 39.9334, longitude: 32.8597, region: 'Middle East' },
  { id: 'c-iq', isoCode: 'IQ', name: 'Iraque', latitude: 33.3152, longitude: 44.3661, region: 'Middle East' },
  { id: 'c-af', isoCode: 'AF', name: 'Afeganistão', latitude: 34.5553, longitude: 69.2075, region: 'Central Asia' },
  { id: 'c-ae', isoCode: 'AE', name: 'Emirados Árabes Unidos', latitude: 24.4539, longitude: 54.3773, region: 'Middle East' },
  { id: 'c-de', isoCode: 'DE', name: 'Alemanha', latitude: 52.52, longitude: 13.405, region: 'Europe' },
  { id: 'c-se', isoCode: 'SE', name: 'Suécia', latitude: 59.3293, longitude: 18.0686, region: 'Europe' },
  { id: 'c-ca', isoCode: 'CA', name: 'Canadá', latitude: 45.4215, longitude: -75.6972, region: 'North America' },
  { id: 'c-us', isoCode: 'US', name: 'Estados Unidos', latitude: 38.9072, longitude: -77.0369, region: 'North America' },
];
