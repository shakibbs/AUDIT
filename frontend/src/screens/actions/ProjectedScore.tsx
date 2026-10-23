import type { ScoreSummary } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { Info } from '@/components/ui/Info';

/** Today's score beside the projected score if the top actions are completed. */
export function ProjectedScore({ score }: { score: ScoreSummary }) {
  const { projected } = score;
  if (score.score === null) {
    return <section className="card card-pad text-[13px] text-txt-2">Today’s score: <span className="font-semibold">Not measured yet</span>. The projection appears once a month has been scored.</section>;
  }
  return (
    <section className="card card-pad flex flex-wrap items-center gap-x-8 gap-y-4">
      <div>
        <div className="kpi-tag">Today</div>
        <div className="font-display text-[34px] font-extrabold leading-tight">{score.score.toFixed(1)} <span className="text-[15px] font-bold text-txt-2">grade {score.grade}</span></div>
      </div>
      <Icon name="chevron-right" size={22} className="text-txt-3" />
      <div>
        <div className="kpi-tag flex items-center gap-1.5">Projected <Info text="An estimate from the score impact of each action. It is a projection, not a measurement, and assumes nothing else changes." /></div>
        {projected
          ? <div className="font-display text-[34px] font-extrabold leading-tight">{projected.score.toFixed(1)} <span className="text-[15px] font-bold text-txt-2">grade {projected.grade}</span></div>
          : <div className="font-display text-[20px] font-bold leading-tight text-txt-3">No open actions</div>}
      </div>
      {projected && <p className="m-0 max-w-md text-[13px] text-txt-2">If the top {projected.actions} actions are completed.{projected.clearsCap && score.cap ? ' The share of contacts without proof would fall under the hard-cap limit, so the grade would no longer be held down.' : ''}</p>}
    </section>
  );
}
