import { useQuery } from '@tanstack/react-query';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { countryService } from '../../services/countryService';
import { useDashboardStore } from '../../stores/dashboardStore';
import { filterExcludedCountries } from '../../utils/countryFilters';

export function Filters() {
  const store = useDashboardStore();
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: countryService.list,
    staleTime: 300_000,
    select: filterExcludedCountries,
  });

  return (
    <div className="filters">
      <div className="filter-title">
        <SlidersHorizontal size={15} /> FILTROS
      </div>

      <select
        aria-label="País de destino"
        value={store.destinationId ?? ''}
        onChange={(e) => store.setFilter({ destinationId: e.target.value || undefined })}
      >
        <option value="">Todos os destinos</option>
        {countries.map((country) => (
          <option value={country.id} key={country.id}>
            {country.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Ano"
        value={store.year ?? ''}
        onChange={(e) => store.setFilter({ year: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">Todos os anos</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
      </select>

      <select
        aria-label="Tipo de fluxo"
        value={store.routeType ?? ''}
        onChange={(e) => store.setFilter({ routeType: (e.target.value || undefined) as typeof store.routeType })}
      >
        <option value="">Todos os fluxos</option>
        <option value="departure">EXIT</option>
        <option value="return">RETURN</option>
        <option value="transit">TRANSIT</option>
      </select>

      <button className="icon-button" title="Limpar filtros" onClick={store.reset}>
        <RotateCcw size={15} />
      </button>
    </div>
  );
}
