import type { Insured } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { FACTOR_LAW, FACTOR_NAMES, FACTOR_WEIGHTS } from '@/lib/exposure';

/** The six factors, modeled (outside-in) beside measured (inside-out), with the points each adds to D. */
export function FactorTable({ insured }: { insured: Insured }) {
  const { inside, outside } = insured.exposure;
  const maxPoints = FACTOR_WEIGHTS[0] * 100;
  return (
    <Card title="Six factors" sub="Each 0–100, higher is worse. The bar shows the points a factor adds to D, out of its maximum" flush>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Factor</th><th>Weight</th><th>Outside-in (modeled)</th><th>Inside-out (measured)</th><th className="w-[230px]">Points toward D</th></tr></thead>
          <tbody>
            {FACTOR_NAMES.map((name, k) => {
              const fi = inside?.factors[k] ?? null;
              const fo = outside?.factors[k] ?? null;
              const f = fi ?? fo ?? 0;
              const points = f * FACTOR_WEIGHTS[k];
              const diff = fi !== null && fo !== null ? fi - fo : null;
              const colour = f >= 67 ? 'var(--bad)' : f >= 40 ? 'var(--warn)' : 'var(--ok)';
              return (
                <tr key={name}>
                  <td><span className="font-semibold">{name}</span><div className="tiny mono">{FACTOR_LAW[k]}</div></td>
                  <td className="mono">{Math.round(FACTOR_WEIGHTS[k] * 100)}%</td>
                  <td className="mono">{fo ?? '—'}</td>
                  <td className="mono font-semibold">{fi ?? '—'}{diff !== null && diff !== 0 && <span className="ml-1.5 text-[11px]" style={{ color: diff > 0 ? 'var(--bad-ink)' : 'var(--ok-ink)' }}>{diff > 0 ? '+' : ''}{diff}</span>}</td>
                  <td>
                    <div className="h-2.5 overflow-hidden rounded-[4px] bg-surface-3" style={{ width: `${(FACTOR_WEIGHTS[k] * 100 / maxPoints) * 100}%` }}>
                      <div className="h-full rounded-r-[4px]" style={{ width: `${f}%`, background: colour }} />
                    </div>
                    <div className="tiny mt-1">{points.toFixed(0)} of {Math.round(FACTOR_WEIGHTS[k] * 100)} points</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="tiny m-0 px-[22px] py-3">Outside-in scores snap to 0 / 25 / 50 / 75 / 100 from cited public evidence. Inside-out = 100 − the weighted score of the metrics mapped to the factor; any metric CiV cannot verify scores at its worst case.</p>
    </Card>
  );
}
