import type { PickingInfo } from '@deck.gl/core';
import { ArcLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import { useMemo, useState } from 'react';
import { Home, Minus, Plus } from 'lucide-react';
import MapGL from 'react-map-gl';
import { config } from '../../config/env';
import type { MigrationRoute } from '../../types/api';

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';
const FALLBACK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: 51.389,
  latitude: 32.5,
  zoom: 2.9,
  pitch: 35,
  bearing: -4,
};

const TYPE_COLOR: Record<MigrationRoute['type'], [number, number, number]> = {
  departure: [251, 82, 105],
  return: [53, 216, 154],
  transit: [77, 217, 255],
};

const TYPE_LABEL: Record<MigrationRoute['type'], string> = {
  departure: 'Saída',
  return: 'Retorno',
  transit: 'Trânsito',
};

interface Node {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  volume: number;
}

/** Identifica o país de origem mais frequente nas rotas para tratá-lo como "hub" visual. */
function resolveHub(routes: MigrationRoute[]) {
  const counts = new Map<string, { count: number; route: MigrationRoute }>();
  routes.forEach((route) => {
    const key = route.origin.countryId;
    const current = counts.get(key);
    counts.set(key, { count: (current?.count ?? 0) + 1, route });
  });
  let best: { count: number; route: MigrationRoute } | undefined;
  counts.forEach((entry) => {
    if (!best || entry.count > best.count) best = entry;
  });
  return best?.route.origin;
}

function buildDestinationNodes(routes: MigrationRoute[]): Node[] {
  const byCountry = new Map<string, Node>();
  routes.forEach((route) => {
    const d = route.destination;
    const existing = byCountry.get(d.countryId);
    if (existing) {
      existing.volume += route.estimatedVolume;
    } else {
      byCountry.set(d.countryId, {
        id: d.countryId,
        name: d.name,
        longitude: d.coordinates.longitude,
        latitude: d.coordinates.latitude,
        volume: route.estimatedVolume,
      });
    }
  });
  return Array.from(byCountry.values());
}

export function MigrationMap({
  routes,
  onHoverRoute,
}: {
  routes: MigrationRoute[];
  onHoverRoute?: (route?: MigrationRoute) => void;
}) {
  const [tip, setTip] = useState<{ route: MigrationRoute; x: number; y: number }>();
  const [hoveredId, setHoveredId] = useState<string>();
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const hub = useMemo(() => resolveHub(routes), [routes]);
  const destinationNodes = useMemo(() => buildDestinationNodes(routes), [routes]);
  const topLabels = useMemo(
    () => destinationNodes.slice().sort((a, b) => b.volume - a.volume).slice(0, 6),
    [destinationNodes],
  );
  const maxVolume = useMemo(
    () => Math.max(...destinationNodes.map((n) => n.volume), 1),
    [destinationNodes],
  );

  const layers = useMemo(
    () => [
      new ArcLayer<MigrationRoute>({
        id: 'migration-arcs',
        data: routes,
        pickable: true,
        greatCircle: true,
        getSourcePosition: (d) => [d.origin.coordinates.longitude, d.origin.coordinates.latitude],
        getTargetPosition: (d) => [d.destination.coordinates.longitude, d.destination.coordinates.latitude],
        getSourceColor: (d) => {
          const [r, g, b] = TYPE_COLOR[d.type];
          return [r, g, b, d.id === hoveredId ? 255 : 210];
        },
        getTargetColor: (d) => {
          const [r, g, b] = TYPE_COLOR[d.type];
          return [r, g, b, d.id === hoveredId ? 220 : 70];
        },
        getWidth: (d) => {
          const base = Math.max(1.1, Math.min(5, Math.sqrt(d.estimatedVolume) / 38));
          return d.id === hoveredId ? base + 2.4 : base;
        },
        getHeight: 0.55,
        updateTriggers: {
          getSourceColor: hoveredId,
          getTargetColor: hoveredId,
          getWidth: hoveredId,
        },
        transitions: { getWidth: 180 },
      }),
      new ScatterplotLayer<Node>({
        id: 'destination-glow',
        data: destinationNodes,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: (d) => 14000 + (d.volume / maxVolume) * 46000,
        getFillColor: [77, 217, 255, 40],
        stroked: false,
        pickable: false,
      }),
      new ScatterplotLayer<Node>({
        id: 'destination-nodes',
        data: destinationNodes,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: (d) => 5000 + (d.volume / maxVolume) * 13000,
        getFillColor: [12, 20, 34, 235],
        getLineColor: [77, 217, 255, 255],
        lineWidthMinPixels: 1.5,
        stroked: true,
        pickable: false,
      }),
      ...(hub
        ? [
            new ScatterplotLayer<{ id: string }>({
              id: 'hub-glow',
              data: [{ id: hub.countryId }],
              getPosition: () => [hub.coordinates.longitude, hub.coordinates.latitude],
              getRadius: 70000,
              getFillColor: [77, 217, 255, 35],
              stroked: false,
            }),
            new ScatterplotLayer<{ id: string }>({
              id: 'hub-node',
              data: [{ id: hub.countryId }],
              getPosition: () => [hub.coordinates.longitude, hub.coordinates.latitude],
              getRadius: 9000,
              getFillColor: [4, 12, 22, 255],
              getLineColor: [77, 217, 255, 255],
              lineWidthMinPixels: 2,
              stroked: true,
            }),
            new TextLayer<{ id: string; name: string }>({
              id: 'hub-label',
              data: [{ id: hub.countryId, name: hub.name.toUpperCase() }],
              getPosition: () => [hub.coordinates.longitude, hub.coordinates.latitude],
              getText: (d) => d.name,
              getSize: 15,
              getColor: [231, 237, 247, 255],
              getPixelOffset: [0, -24],
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              getTextAnchor: 'middle',
            }),
          ]
        : []),
      new TextLayer<Node>({
        id: 'destination-labels',
        data: topLabels,
        getPosition: (d) => [d.longitude, d.latitude],
        getText: (d) => d.name,
        getSize: 11,
        getColor: [186, 201, 224, 235],
        getPixelOffset: [0, 16],
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        getTextAnchor: 'middle',
      }),
    ],
    [routes, destinationNodes, maxVolume, hub, topLabels, hoveredId],
  );

  const handleHover = (info: PickingInfo<MigrationRoute>) => {
    setTip(info.object ? { route: info.object, x: info.x, y: info.y } : undefined);
    setHoveredId(info.object?.id);
    onHoverRoute?.(info.object ?? undefined);
  };

  const zoomBy = (delta: number) =>
    setViewState((prev) => ({ ...prev, zoom: Math.min(8, Math.max(1.5, prev.zoom + delta)) }));

  return (
    <div className="map-wrap">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: next }) => setViewState(next as typeof INITIAL_VIEW_STATE)}
        controller
        layers={layers}
        onHover={handleHover}
      >
        <MapGL mapStyle={config.mapboxToken ? MAP_STYLE : FALLBACK_STYLE} mapboxAccessToken={config.mapboxToken} />
      </DeckGL>

      <div className="map-controls">
        <button type="button" aria-label="Aumentar zoom" onClick={() => zoomBy(0.6)}>
          <Plus size={14} />
        </button>
        <button type="button" aria-label="Diminuir zoom" onClick={() => zoomBy(-0.6)}>
          <Minus size={14} />
        </button>
        <button type="button" aria-label="Redefinir visão" onClick={() => setViewState(INITIAL_VIEW_STATE)}>
          <Home size={14} />
        </button>
      </div>

      {tip && (
        <div className="map-tooltip" style={{ left: tip.x + 16, top: tip.y + 16 }}>
          <b>
            {tip.route.origin.name} → {tip.route.destination.name}
          </b>
          <span>{tip.route.estimatedVolume.toLocaleString('pt-BR')} pessoas · {tip.route.year}</span>
          <span className={`tag tag-${tip.route.type}`}>{TYPE_LABEL[tip.route.type]} · dados estimados</span>
        </div>
      )}

      <div className="map-key">
        <span>
          <i className="bg-exit" /> Saídas
        </span>
        <span>
          <i className="bg-return" /> Retornos
        </span>
        <span>
          <i className="bg-cyan" /> Trânsito
        </span>
      </div>
    </div>
  );
}
