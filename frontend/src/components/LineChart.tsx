import type { TimelineEntry } from '../types/api';

export function LineChart({ entries, compact = false }: { entries: TimelineEntry[]; compact?: boolean }) {
  if (!entries.length) return <p className="empty">Nenhum dado para este período.</p>;

  const width = 620;
  const height = compact ? 130 : 170;
  const max = Math.max(...entries.flatMap((entry) => [entry.outbound, entry.inbound]), 1);
  const step = width / Math.max(entries.length - 1, 1);

  const coords = (key: 'outbound' | 'inbound') =>
    entries.map((entry, index) => [index * step, height - (entry[key] / max) * (height - 20)] as const);

  const linePoints = (key: 'outbound' | 'inbound') => coords(key).map(([x, y]) => `${x},${y}`).join(' ');
  const areaPoints = (key: 'outbound' | 'inbound') => {
    const pts = coords(key);
    return `0,${height} ${pts.map(([x, y]) => `${x},${y}`).join(' ')} ${width},${height}`;
  };

  const labelStride = compact ? Math.ceil(entries.length / 4) : 1;

  return (
    <div className={compact ? 'chart-compact' : undefined}>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart" role="img" aria-label="Evolução de saídas e retornos">
        <defs>
          <linearGradient id="fill-exit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb5269" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#fb5269" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fill-return" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#35d89a" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#35d89a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line key={fraction} x1={0} x2={width} y1={height * fraction} y2={height * fraction} className="chart-grid" />
        ))}
        <polygon points={areaPoints('outbound')} fill="url(#fill-exit)" stroke="none" />
        <polygon points={areaPoints('inbound')} fill="url(#fill-return)" stroke="none" />
        <polyline points={linePoints('outbound')} fill="none" stroke="#fb5269" strokeWidth="2.5" />
        <polyline points={linePoints('inbound')} fill="none" stroke="#35d89a" strokeWidth="2.5" />
      </svg>
      <div className="chart-labels">
        {entries
          .filter((_, index) => index % labelStride === 0)
          .map((entry) => (
            <span key={entry.period.label}>{entry.period.label}</span>
          ))}
      </div>
      {!compact && (
        <div className="chart-legend">
          <span>
            <i className="bg-exit" /> Saídas
          </span>
          <span>
            <i className="bg-return" /> Retornos
          </span>
        </div>
      )}
    </div>
  );
}
