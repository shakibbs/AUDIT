'use client';

import { useInsured } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { exposureOf } from '@/lib/exposure';
import { FactorTable } from './FactorTable';
import { InsuredPicker } from './InsuredPicker';
import { useViewer } from './useViewer';

/** Exposure Indicator v2.2: six factors measure what the company does wrong; three multipliers measure the pressure on it. */
export function ExposureScreen() {
  const { insuredId } = useViewer();
  const insured = useInsured(insuredId);
  return (
    <>
      <PageHead eyebrow="Falcon Risk · underwriting" title="Exposure Indicator" sub="Six factors measure what the company does wrong; three multipliers measure the pressure on it. Higher means more exposed. The same factors are scored from public evidence before connection and from the company’s records after.">
        <InsuredPicker />
      </PageHead>
      <Loader query={insured}>
        {(i) => {
          const { inside, outside } = i.exposure;
          const reading = inside ?? outside;
          if (!reading) return <Card><p className="m-0 text-[13px]">No reading yet.</p></Card>;
          const e = exposureOf(reading);
          return (
            <div className="flex flex-col gap-5">
              <div className="note-box" role="note"><strong>Proposed headline, pending sign-off.</strong> Shown in the insurer view only for now; clients keep the Audit Score (decision D1). Weights, multipliers and grade bands follow Exposure Indicator v2.2.</div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi tag="Exposure Indicator" value={String(e.exposure)} unit={`grade ${e.grade}`} foot={`${inside ? 'Measured from records' : 'Modeled from public evidence'}${e.capped ? ` · capped, raw ${e.raw}` : ''}`} />
                <Kpi tag="Defect term D" value={String(e.defect)} foot="What the company can fix: weighted sum of F1–F6" />
                <Kpi tag="Pressure multipliers" value={`×${e.multiplier.toFixed(2)}`} foot={`Venue ${reading.venue.toFixed(2)} · targeting ${reading.targeting.toFixed(2)} · volume ${reading.volume.toFixed(2)}`} />
                <Kpi tag="Evidence coverage" value={`${Math.round(i.coverage * 100)}%`} foot={reading.source} />
              </div>
              <FactorTable insured={i} />
            </div>
          );
        }}
      </Loader>
    </>
  );
}
