import type { ExposureReading } from '@/api/types';
import { exposureOf } from '@/lib/exposure';

/** D × venue × targeting × volume = Exposure, shown as one line of boxes. */
export function MultiplierChain({ reading, label }: { reading: ExposureReading; label: string }) {
  const e = exposureOf(reading);
  const steps: [string, string][] = [[`D ${e.defect}`, 'defect term'], [`× ${reading.venue.toFixed(2)}`, 'venue'], [`× ${reading.targeting.toFixed(2)}`, 'targeting'], [`× ${reading.volume.toFixed(2)}`, 'volume']];
  const tone = e.grade === 'A' || e.grade === 'B' ? 'b-a' : e.grade === 'C' ? 'b-c' : 'b-f';
  return (
    <div>
      <div className="tiny mb-2">{label} · {reading.source}</div>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map(([v, l], k) => (
          <span key={l} className="flex items-center gap-2">
            <span className="rounded-[9px] border border-line px-3 py-2"><span className="mono block text-[15px] font-semibold">{v}</span><span className="tiny">{l}</span></span>
            {k < steps.length - 1 && <span className="text-txt-3">→</span>}
          </span>
        ))}
        <span className="text-txt-3">=</span>
        <span className={`rounded-[9px] px-3 py-2 ${tone}`}><span className="block font-display text-[17px] font-extrabold">{e.exposure} · {e.grade}</span><span className="tiny">{e.capped ? `capped · raw ${e.raw}` : `raw ${e.raw}`}</span></span>
      </div>
    </div>
  );
}
