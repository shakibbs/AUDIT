import type { Insured } from '@/api/types';
import { bandClass } from '@/lib/format';
import { exposureOf } from '@/lib/exposure';

// Exposure grades run the other way from scores: A is the least exposed. Map to the same tints.
const TINT = { A: 'b-a', B: 'b-b', C: 'b-c', D: 'b-d', F: 'b-f' } as const;

/** Exposure Indicator in a table cell: number, grade, and the math beside it. */
export function ExposureCell({ insured }: { insured: Insured }) {
  const reading = insured.exposure.inside ?? insured.exposure.outside;
  if (!reading) return <span className="tiny">—</span>;
  const e = exposureOf(reading);
  return (
    <span className="block">
      <span className="flex items-center gap-2"><span className="font-display text-[16px] font-extrabold">{e.exposure}</span><span className={`grade-badge ${TINT[e.grade] ?? bandClass(null)}`}>{e.grade}</span>{e.capped && <span className="pill pill-red">capped · raw {e.raw}</span>}</span>
      <span className="tiny">D {e.defect} × {e.multiplier.toFixed(2)} · {insured.exposure.inside ? 'measured' : 'modeled'}</span>
    </span>
  );
}
