'use client';

import { useInsured } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { exposureOf } from '@/lib/exposure';
import { FactorTable } from './FactorTable';
import { InsuredPicker } from './InsuredPicker';
import { MultiplierChain } from './MultiplierChain';
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
              <Card title="How the headline is built" sub="Exposure = min(100, D × venue × targeting × volume) · A under 25 · B 25–39 · C 40–48 · D 49–66 · F 67+">
                <div className="flex flex-col gap-5">
                  {inside && <MultiplierChain reading={inside} label="Inside-out · measured" />}
                  {outside && <MultiplierChain reading={outside} label="Outside-in · modeled" />}
                </div>
                <dl className="m-0 mt-5 border-t border-line pt-1">
                  <div className="kv"><dt>Venue</dt><dd className="font-normal">{i.exposure.why.venue}</dd></div>
                  <div className="kv"><dt>Targeting</dt><dd className="font-normal">{i.exposure.why.targeting}</dd></div>
                  <div className="kv"><dt>Volume</dt><dd className="font-normal">{i.exposure.why.volume}</dd></div>
                </dl>
              </Card>
              <Card title="Two questions, kept apart" sub="What the loss model reads">
                <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13px]">
                  <li><strong>How likely to be sued:</strong> driven mostly by the multipliers. A clean company in a busy venue still gets sued and still pays defense.</li>
                  <li><strong>How likely to lose:</strong> driven by D. A company with a low D defends cheaply and rarely pays a settlement.</li>
                </ul>
              </Card>
            </div>
          );
        }}
      </Loader>
    </>
  );
}
