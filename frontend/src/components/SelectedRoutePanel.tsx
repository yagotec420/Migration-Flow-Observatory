import { ArrowRight } from 'lucide-react';
import type { MigrationRoute } from '../types/api';

const TYPE_LABEL: Record<MigrationRoute['type'], string> = {
  departure: 'Saída',
  return: 'Retorno',
  transit: 'Trânsito',
};

const fmt = new Intl.NumberFormat('pt-BR');

export function SelectedRoutePanel({
  route,
  fallbackCount,
}: {
  route?: MigrationRoute;
  fallbackCount: number;
}) {
  if (!route) {
    return (
      <div className="selected-route empty-state">
        <p className="eyebrow text-cyan">FLUXO EM FOCO</p>
        <p className="hint">Passe o cursor sobre um arco no mapa para ver os detalhes da rota.</p>
        <div className="hint-meta">
          <span>{fmt.format(fallbackCount)}</span> rotas cartografadas no período selecionado
        </div>
      </div>
    );
  }

  return (
    <div className="selected-route">
      <p className="eyebrow text-cyan">FLUXO EM FOCO</p>
      <div className="selected-route-title">
        <b>{route.origin.name}</b>
        <ArrowRight size={16} />
        <b>{route.destination.name}</b>
        <span className={`tag tag-${route.type}`}>{TYPE_LABEL[route.type]}</span>
      </div>
      <div className="selected-route-value">{fmt.format(route.estimatedVolume)}</div>
      <p className="hint">pessoas estimadas · ano de referência {route.year}</p>
    </div>
  );
}
