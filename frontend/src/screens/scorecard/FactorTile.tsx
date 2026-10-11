'use client';

import type { Grade } from '@/api/types';
import { useDrawer } from '@/state/DrawerContext';
import { DOUBLE_WEIGHT } from '@/lib/exposure';

const TINT: Record<Grade, string> = { A: 'b-a', B: 'b-b', C: 'b-c', D: 'b-d', F: 'b-f' };

/** One factor: its 0–100 value (higher = worse), weight, points it adds to D, and the metrics that move it. */
export function FactorTile({ code, name, law, value, grade, weight, metrics, known }: {
  code: string; name: string; law: string; value: number | null; grade: Grade | null; weight: number; metrics: string[]; known: Set<string>;
}) {
  const { open } = useDrawer();
  const max = Math.round(weight * 100);
  const points = value === null ? null : value * weight;
  const colour = value === null ? 'var(--series-muted)' : value >= 67 ? 'var(--bad)' : value >= 40 ? 'var(--warn)' : 'var(--ok)';
  return (
    <section className={`flex flex-col gap-2 rounded-[12px] border border-transparent p-4 ${grade ? TINT[grade] : 'b-n'}`} title={law}>
      <div className="flex items-center justify-between">
        <span className="mono text-[11px] font-semibold">{code}</span>
        <span className="text-[11px] font-semibold">weight {max}%</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[26px] font-extrabold leading-none text-txt">{value === null ? 'Pending' : Math.round(value)}</span>
        {grade && <span className="font-display text-[13px] font-extrabold">{grade}</span>}
      </div>
      <div className="text-[13px] font-semibold leading-snug text-txt">{name}</div>
      <div className="h-2 overflow-hidden rounded-[4px] bg-surface/70">
        <div className="h-full rounded-r-[4px]" style={{ width: `${value ?? 0}%`, background: colour }} />
      </div>
      <div className="tiny">{points === null ? 'Not yet measured' : `${points.toFixed(1)} of ${max} points toward D`}</div>
      <div className="mt-1 flex flex-wrap gap-1" aria-label={`Metrics that move ${code}`}>
        {metrics.map((m) => {
          const label = `${m}${DOUBLE_WEIGHT.has(m) ? ' ×2' : ''}`;
          return known.has(m)
            ? <button key={m} type="button" className="dcode" onClick={() => open('metric', m)} aria-label={`Open metric ${m}`}>{label}</button>
            : <span key={m} className="dcode !cursor-default opacity-60" title="Not yet measured">{label}</span>;
        })}
      </div>
    </section>
  );
}
