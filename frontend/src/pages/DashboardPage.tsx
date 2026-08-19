import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Globe2, MapPinned, Network } from 'lucide-react';
import { DonutChart } from '../components/DonutChart';
import { LineChart } from '../components/LineChart';
import { MetricCard } from '../components/MetricCard';
import { Panel } from '../components/Panel';
import { SelectedRoutePanel } from '../components/SelectedRoutePanel';
import { Filters } from '../features/filters/Filters';
import { MigrationMap } from '../features/migration-map/MigrationMap';
import { TimelineControls } from '../features/timeline/TimelineControls';
import { useRoutes, useStatistics, useTimeline } from '../hooks/useDashboardData';
import { useDashboardStore } from '../stores/dashboardStore';
import type { MigrationRoute } from '../types/api';

const fmt = new Intl.NumberFormat('pt-BR');

const TYPE_COLOR: Record<MigrationRoute['type'], string> = {
  departure: '#fb5269',
  return: '#35d89a',
  transit: '#4dd9ff',
};

const TYPE_LABEL: Record<MigrationRoute['type'], string> = {
  departure: 'Saídas',
  return: 'Retornos',
  transit: 'Trânsito',
};

export function DashboardPage() {
  const { destinationId, routeType, year, granularity, selectedMonth } = useDashboardStore();
  const [hoveredRoute, setHoveredRoute] = useState<MigrationRoute>();

  const { data: routes = [], isLoading: loadingRoutes, error: routesError } = useRoutes({ type: routeType, year });
  const filteredRoutes = destinationId
    ? routes.filter((route) => route.destination.countryId === destinationId)
    : routes;

  const { data: stats } = useStatistics('c-ir');
  const { data: timeline = [] } = useTimeline({ countryId: 'c-ir', granularity });
  const chartTimeline =
    selectedMonth && granularity === 'month' ? timeline.filter((entry) => entry.period.month <= selectedMonth) : timeline;

  const outbound = stats?.totals.outbound ?? 0;
  const inbound = stats?.totals.inbound ?? 0;
  const destinationCount = useMemo(
    () => new Set(filteredRoutes.map((route) => route.destination.countryId)).size,
    [filteredRoutes],
  );

  const typeBreakdown = useMemo(() => {
    const totals = new Map<MigrationRoute['type'], number>();
    filteredRoutes.forEach((route) => totals.set(route.type, (totals.get(route.type) ?? 0) + 1));
    return (['departure', 'return', 'transit'] as const)
      .filter((type) => (totals.get(type) ?? 0) > 0)
      .map((type) => ({ label: TYPE_LABEL[type], value: totals.get(type) ?? 0, color: TYPE_COLOR[type] }));
  }, [filteredRoutes]);

  const topRoutes = filteredRoutes.slice().sort((a, b) => b.estimatedVolume - a.estimatedVolume).slice(0, 5);
  const lastEntry = chartTimeline.at(-1);

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow text-cyan">MIGRATION FLOW OBSERVATORY</p>
          <h1>Iran migration intelligence</h1>
          <p className="subtitle">Monitoramento visual de estimativas migratórias · dados não oficiais</p>
        </div>
        <div className="status">
          <span className="live-dot return" /> SISTEMA ONLINE
        </div>
      </header>

      <Filters />

      <div className="metrics">
        <MetricCard label="SAÍDAS DO IRÃ" value={outbound} tone="exit" Icon={ArrowUpRight} />
        <MetricCard label="RETORNOS AO IRÃ" value={inbound} tone="return" Icon={ArrowDownLeft} />
        <article className="metric-card">
          <div className="flex items-center justify-between">
            <span className="eyebrow">ROTAS ATIVAS</span>
            <span className="metric-icon text-cyan">
              <Network size={17} />
            </span>
          </div>
          <div className="metric-value text-slate-100">{fmt.format(filteredRoutes.length)}</div>
          <p className="mt-2 text-[10px] font-bold tracking-[.16em] text-slate-400">FLUXOS CARTOGRAFADOS</p>
        </article>
        <article className="metric-card">
          <div className="flex items-center justify-between">
            <span className="eyebrow">PAÍSES DE DESTINO</span>
            <span className="metric-icon text-cyan">
              <MapPinned size={17} />
            </span>
          </div>
          <div className="metric-value text-slate-100">{fmt.format(destinationCount)}</div>
          <p className="mt-2 text-[10px] font-bold tracking-[.16em] text-slate-400">NO PERÍODO SELECIONADO</p>
        </article>
      </div>

      <div className="hero-grid">
        <Panel
          title="Fluxos migratórios globais"
          action={
            <span className="map-label">
              <Globe2 size={14} /> IRÃ — FOCO
            </span>
          }
          className="map-panel"
        >
          {loadingRoutes ? (
            <div className="loader">Carregando mapa…</div>
          ) : routesError ? (
            <div className="error">Falha ao carregar as rotas.</div>
          ) : (
            <MigrationMap routes={filteredRoutes} onHoverRoute={setHoveredRoute} />
          )}
        </Panel>

        <Panel title="Fluxo selecionado" className="side-panel">
          <SelectedRoutePanel route={hoveredRoute} fallbackCount={filteredRoutes.length} />
          <div className="side-divider" />
          <p className="eyebrow text-cyan">EVOLUÇÃO TEMPORAL</p>
          <LineChart entries={chartTimeline} compact />
        </Panel>
      </div>

      <Panel title="Timeline operacional" className="timeline-panel">
        <TimelineControls maxMonth={Math.max(timeline.length, 1)} />
        <div className="timeline-summary">
          <div>
            <span>PERÍODO</span>
            <b>{lastEntry?.period.label ?? '—'}</b>
          </div>
          <div>
            <span>SALDO</span>
            <b className={(lastEntry?.netBalance ?? 0) < 0 ? 'text-exit' : 'text-return'}>
              {fmt.format(lastEntry?.netBalance ?? 0)}
            </b>
          </div>
        </div>
      </Panel>

      <div className="bottom-grid">
        <Panel title="Principais destinos" className="destinations-panel">
          <ol className="route-list">
            {topRoutes.map((route, index) => (
              <li key={route.id}>
                <span className="rank">0{index + 1}</span>
                <div>
                  <b>{route.destination.name}</b>
                  <small>
                    {route.type.toUpperCase()} · {route.year}
                  </small>
                </div>
                <strong>{fmt.format(route.estimatedVolume)}</strong>
              </li>
            ))}
            {!topRoutes.length && <p className="empty">Nenhuma rota para este filtro.</p>}
          </ol>
        </Panel>

        <Panel title="Tipos de fluxo" className="donut-panel">
          <DonutChart slices={typeBreakdown} />
        </Panel>

        <Panel title="Evolução histórica" className="chart-panel">
          <LineChart entries={chartTimeline} />
        </Panel>
      </div>

      <footer>
        <AlertTriangle size={13} /> Dados simulados/estimados para demonstração técnica. Não utilizar como fonte oficial.
      </footer>
    </main>
  );
}
