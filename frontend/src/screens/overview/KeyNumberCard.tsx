import { AreaSparkline } from '@/components/charts/AreaSparkline';
import { Delta } from '@/components/ui/Delta';

export interface KeyNumberProps {
  tag: string; code?: string; value: string; unit?: string; foot: string; onClick: () => void;
  trend?: { values: (number | null)[]; better: 'higher' | 'lower' | 'none'; unit: string; since: string };
  bar?: { share: number; caption: string; tone: 'ok' | 'bad' };
}

/** One stat card: the number with a trend chart or a progress bar beside it, the change, and one line of context. */
export function KeyNumberCard({ tag, code, value, unit, foot, onClick, trend, bar }: KeyNumberProps) {
  const last = trend?.values[trend.values.length - 1];
  const prev = trend?.values[trend.values.length - 2];
  return (
    <button type="button" onClick={onClick} className="card flex h-full w-full cursor-pointer flex-col gap-3 p-[18px] text-left transition hover:border-brand hover:shadow-lg">
      <span className="kpi-tag flex items-start justify-between gap-3"><span>{tag}</span>{code && <span className="mono normal-case tracking-normal">{code}</span>}</span>
      <span className="flex items-end justify-between gap-3">
        <span className="kpi-val whitespace-nowrap">{value}{unit && <small> {unit}</small>}</span>
        {/* Long numbers get a narrower chart so the two never overlap. */}
        {trend && <AreaSparkline values={trend.values} width={value.length > 6 ? 72 : 120} label={`${tag}, last 4 months`} />}
      </span>
      {trend && last != null && prev != null && <Delta value={last - prev} better={trend.better} unit={trend.unit} label={`vs ${trend.since}`} />}
      {bar && (
        <span className="block">
          <span className="block h-2 overflow-hidden rounded-full bg-surface-3">
            <span className="block h-full rounded-full" style={{ width: `${Math.min(100, Math.max(2, bar.share * 100))}%`, background: bar.tone === 'ok' ? 'var(--series-1)' : 'var(--series-3)' }} />
          </span>
          <span className="tiny mt-1.5 block">{bar.caption}</span>
        </span>
      )}
      <span className="kpi-foot mt-auto border-t border-line-2 pt-2.5">{foot}</span>
    </button>
  );
}
