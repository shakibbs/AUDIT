'use client';

import type { ExposureReading } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { exposureGrade, exposureOf, FACTOR_LAW, FACTOR_METRICS, FACTOR_SHORT, FACTOR_WEIGHTS } from '@/lib/exposure';
import { FactorTile } from './FactorTile';

const LEGEND: [string, string][] = [['A', 'b-a'], ['B', 'b-b'], ['C', 'b-c'], ['D', 'b-d'], ['F', 'b-f'], ['Pending', 'b-n']];

/** The six factors of the Exposure Indicator, and how they add up to D and the headline. */
export function FactorMap({ reading, measured, knownMetrics }: { reading: ExposureReading; measured: boolean; knownMetrics: Set<string> }) {
  const e = exposureOf(reading);
  return (
    <Card title="Six factors" sub={`${measured ? 'Measured from your records' : 'Modeled from public evidence'} · each 0–100, higher is worse · select a metric code for its detail`}
      right={
        <div className="hidden flex-wrap items-center gap-1.5 md:flex" aria-label="Level colours">
          {LEGEND.map(([label, cls]) => <span key={label} className={`rounded-md px-2 py-0.5 font-display text-[11px] font-bold ${cls}`}>{label}</span>)}
        </div>
      }>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FACTOR_SHORT.map((name, k) => {
          const value = reading.factors[k] ?? null;
          return (
            <FactorTile key={name} code={`F${k + 1}`} name={name} law={FACTOR_LAW[k]} weight={FACTOR_WEIGHTS[k]}
              value={value} grade={value === null ? null : exposureGrade(value)} metrics={FACTOR_METRICS[k]} known={knownMetrics} />
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line-2 pt-3 text-[13px]">
        <span><span className="tiny">D (defects)</span> <strong className="mono">{e.defect}</strong></span>
        <span className="tiny">× Venue <span className="mono">{reading.venue.toFixed(2)}</span> × Targeting <span className="mono">{reading.targeting.toFixed(2)}</span> × Volume <span className="mono">{reading.volume.toFixed(2)}</span></span>
        <span><span className="tiny">= Exposure</span> <strong className="mono">{e.exposure}</strong> <span className="tiny">grade {e.grade}{e.capped ? ` · raw ${e.raw}` : ''}</span></span>
      </div>
      <p className="tiny mb-0 mt-2">D = 0.28·F1 + 0.20·F2 + 0.17·F3 + 0.16·F4 + 0.11·F5 + 0.08·F6. A factor is 100 minus the average score of its metrics; M10 and M34 count twice. Faded codes are not yet measured and are left out, never counted as zero.</p>
    </Card>
  );
}
