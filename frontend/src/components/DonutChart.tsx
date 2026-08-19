interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

const RADIUS = 42;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (!total) return <p className="empty">Nenhum dado para este período.</p>;

  let offset = 0;

  return (
    <div className="donut">
      <svg viewBox="0 0 100 100" className="donut-svg" role="img" aria-label="Distribuição por tipo de fluxo">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#141f30" strokeWidth={STROKE} />
        {slices.map((slice) => {
          const fraction = slice.value / total;
          const length = fraction * CIRCUMFERENCE;
          const dashArray = `${length} ${CIRCUMFERENCE - length}`;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={slice.label}
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={slice.color}
              strokeWidth={STROKE}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              strokeLinecap="butt"
            />
          );
        })}
        <text x="50" y="47" textAnchor="middle" className="donut-total">
          {total.toLocaleString('pt-BR')}
        </text>
        <text x="50" y="61" textAnchor="middle" className="donut-total-label">
          ROTAS
        </text>
      </svg>
      <ul className="donut-legend">
        {slices.map((slice) => (
          <li key={slice.label}>
            <i style={{ background: slice.color }} />
            <span>{slice.label}</span>
            <b>{Math.round((slice.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
