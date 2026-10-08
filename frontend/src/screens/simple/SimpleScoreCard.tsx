import type { ScoreSummary } from '@/api/types';
import { Gauge } from '@/components/charts/Gauge';
import { Meter } from '@/components/charts/Meter';
import { Delta } from '@/components/ui/Delta';
import { bandClass } from '@/lib/format';

/** The score, its grade, why the grade may be held, and how much of it is backed by proof. */
export function SimpleScoreCard({ score }: { score: ScoreSummary }) {
  const coverage = Math.round(score.evidenceCoverage * 100);
  return (
    <section className="card card-pad flex flex-col items-center text-center">
      <h2 className="text-[17px]">Your Audit Score</h2>
      <div className="mt-3"><Gauge score={score.score} grade={score.grade} /></div>
      <span className={`pill mt-3 ${bandClass(score.score)}`}>Grade {score.grade}</span>
      <div className="mt-2"><Delta value={score.score - score.previous} /></div>
      {score.cap && (
        <p className="mb-0 mt-4 max-w-sm text-[13px] text-txt-2">
          <strong className="text-txt">Grade held at {score.grade}.</strong> Too many contacts that need proof of permission have none on record ({score.cap.share.toFixed(1)}%, the limit is {score.cap.limit}%).
        </p>
      )}
      <div className="mt-5 w-full max-w-sm text-left">
        <div className="mb-1.5 flex justify-between text-[12.5px]"><span className="text-txt-2">How much of this score is backed by proof</span><span className="mono font-semibold">{coverage}%</span></div>
        <Meter label="Evidence coverage" value={coverage} limit={100} />
      </div>
    </section>
  );
}
