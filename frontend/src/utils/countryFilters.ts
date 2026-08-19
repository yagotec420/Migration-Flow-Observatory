import type { Country, MigrationRoute } from '../types/api';

/**
 * Países removidos da visualização a pedido do produto: os arcos de longa
 * distância até Canadá e Estados Unidos poluíam visualmente o globo.
 * Filtragem feita apenas no frontend — API, backend e banco permanecem intactos.
 */
const EXCLUDED_COUNTRY_NAMES = ['canadá', 'canada', 'estados unidos', 'united states', 'eua', 'usa'];

function isExcludedCountryName(name: string | undefined): boolean {
  if (!name) return false;
  return EXCLUDED_COUNTRY_NAMES.includes(name.trim().toLowerCase());
}

export function filterExcludedRoutes(routes: MigrationRoute[]): MigrationRoute[] {
  return routes.filter(
    (route) => !isExcludedCountryName(route.origin.name) && !isExcludedCountryName(route.destination.name),
  );
}

export function filterExcludedCountries(countries: Country[]): Country[] {
  return countries.filter((country) => !isExcludedCountryName(country.name));
}
