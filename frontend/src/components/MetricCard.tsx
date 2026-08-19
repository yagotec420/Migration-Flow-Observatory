import type { LucideIcon } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

function Odometer({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 70, damping: 18 });
  const rounded = useTransform(spring, (latest) => Math.round(latest).toLocaleString('pt-BR'));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function MetricCard({
  label,
  value,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  tone: 'exit' | 'return';
  Icon: LucideIcon;
}) {
  const color = tone === 'exit' ? 'text-exit' : 'text-return';

  return (
    <article className="metric-card">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span className={`metric-icon ${color}`}>
          <Icon size={17} />
        </span>
      </div>
      <div className={`metric-value ${color}`}>
        <Odometer value={value} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] font-bold tracking-[.16em] text-slate-400">
        <span className={`live-dot ${tone}`} /> LIVE · PESSOAS ESTIMADAS
      </div>
    </article>
  );
}
