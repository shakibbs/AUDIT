import type { Insured } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { FACTOR_LAW, FACTOR_NAMES, FACTOR_WEIGHTS } from '@/lib/exposure';

/** Short six-factor table: one line per factor, the law shown on hover. */
export function CompactFactors({ insured, className = '' }: { insured: Insured; className?: string }) {
  const { inside, outside } = insured.exposure;
  return (
    <Card title="Six factors" sub="Each 0–100, higher is worse · bar = points added to D" flush className={className}>
      <table className="tbl [&_td]:!py-2.5 [&_th]:!py-2.5">
        <thead><tr><th>Factor</th><th className="text-right">Weight</th><th className="text-right">Modeled</th><th className="text-right">Measured</th><th className="w-[34%]">Points toward D</th></tr></thead>
        <tbody>
          {FACTOR_NAMES.map((name, k) => {
            const fi = inside?.factors[k] ?? null;
            const fo = outside?.factors[k] ?? null;
            const f = fi ?? fo ?? 0;
            const max = Math.round(FACTOR_WEIGHTS[k] * 100);
            const colour = f >= 67 ? 'var(--bad)' : f >= 40 ? 'var(--warn)' : 'var(--ok)';
            return (
              <tr key={name} title={FACTOR_LAW[k]}>
                <td className="whitespace-nowrap font-semibold">{name}</td>
                <td className="mono text-right">{max}%</td>
                <td className="mono text-right text-txt-2">{fo ?? '—'}</td>
                <td className="mono text-right font-semibold">{fi ?? '—'}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-[4px] bg-surface-3">
                      <div className="h-full rounded-r-[4px]" style={{ width: `${f}%`, background: colour }} />
                    </div>
                    <span className="mono tiny w-[44px] text-right">{(f * FACTOR_WEIGHTS[k]).toFixed(0)}/{max}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
