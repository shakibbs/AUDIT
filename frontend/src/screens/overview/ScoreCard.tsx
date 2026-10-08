import type { ScoreSummary } from '@/api/types';
import { Gauge } from '@/components/charts/Gauge';
import { Meter } from '@/components/charts/Meter';
import { Delta } from '@/components/ui/Delta';
import { Info } from '@/components/ui/Info';
import { bandClass, formatCount } from '@/lib/format';

/** The Audit Score with everything that qualifies it: caps, evidence coverage, confirmed-rules score, projection. */
export function ScoreCard({ score }: { score: ScoreSummary }) {
  const coverage = Math.round(score.evidenceCoverage * 100);
  return (
    <section className="card card-pad flex flex-col">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[15px]">Audit Score <Info text="The average of every measured domain score. Unverified inputs count at their worst-case value." /></h3>
        <span className={`pill ${bandClass(score.score)}`}>Grade {score.grade}{score.caps.some((c) => c.held) ? ' · held' : ''}</span>
      </div>
      <Gauge score={score.score} grade={score.grade} />
      <div className="mt-2 text-center"><Delta value={score.score - score.previous} /></div>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[12.5px]">
          <span className="flex items-center gap-1.5 text-txt-2">Evidence coverage <Info text="How much of the score rests on records CiV checked itself or read from your systems. Statements and missing sources count for nothing." /></span>
          <span className="mono font-semibold">{coverage}%</span>
        </div>
        <Meter label="Evidence coverage" value={coverage} limit={100} />
      </div>

      {score.caps.length > 0 && (
        <ul className="m-0 mt-4 list-none space-y-1.5 border-t border-line p-0 pt-3">
          {score.caps.map((c) => (
            <li key={c.name} className="flex items-start gap-2 text-[12.5px]">
              <span className={`pill mt-px ${c.held ? 'pill-red' : 'pill-green'}`}>{c.held ? 'Holding' : 'Clear'}</span>
              <span><span className="font-semibold">{c.name}.</span> <span className="text-txt-2">{c.detail}</span></span>
            </li>
          ))}
        </ul>
      )}

      <dl className="m-0 mt-3 border-t border-line pt-1">
        <div className="kv"><dt className="flex items-center gap-1.5">Confirmed-rules score <Info text="The score using only settings counsel has confirmed. Domains that depend on a pending setting are left out." /></dt><dd className="mono">{score.confirmedScore.toFixed(1)}</dd></div>
        <div className="kv"><dt className="flex items-center gap-1.5">Projected <Info text="An estimate if the top open problems are resolved. A projection, not a measurement." /></dt><dd><span className="mono">{score.projected.score.toFixed(1)}</span> · grade {score.projected.grade}</dd></div>
        <div className="kv"><dt>Checkpoints run</dt><dd className="mono">{formatCount(score.checkpointsRun)} of {formatCount(score.checkpointsTotal)}</dd></div>
      </dl>
    </section>
  );
}
