'use client';

import Link from 'next/link';
import { useActions, useAlerts, useScore } from '@/api/queries';
import { TrendLine } from '@/components/charts/TrendLine';
import { SeeFullDetails } from '@/components/shell/SeeFullDetails';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { usePortal } from '@/state/PortalContext';
import { SimpleScoreCard } from './SimpleScoreCard';

/** Simple view home: the score, how it is moving, and what needs attention. */
export function SimpleHomeScreen() {
  const { period } = usePortal();
  const score = useScore(period);
  const alerts = useAlerts().data ?? [];
  const actions = useActions().data ?? [];
  const urgent = alerts.filter((a) => a.severity === 'High' && !a.reviewed).length;
  const open = actions.filter((a) => a.status !== 'resolved').length;

  return (
    <>
      <PageHead eyebrow="Simple view" title="Home" sub="Where you stand this month, in one page." />
      <Loader query={score}>
        {(s) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <SimpleScoreCard score={s} />
              <Card title="Score over time" sub="Your Audit Score each month, and what changed it" right={<SeeFullDetails href="/scorecard" />}>
                <TrendLine label="Audit Score by month" height={220} points={s.history.map((h) => ({ label: h.label, value: Math.round(h.score * 10) / 10, note: h.event }))} target={{ value: 80, label: 'Grade B from 80' }} />
                <ul className="m-0 mt-3 list-none space-y-1.5 p-0 text-[13px] text-txt-2">
                  {s.history.slice(-2).map((h) => <li key={h.period}><strong className="text-txt">{h.label}:</strong> {h.event}</li>)}
                </ul>
              </Card>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/alerts" className="card kpi clickcard no-underline hover:no-underline">
                <span className="kpi-tag">Urgent alerts</span>
                <span className="kpi-val">{urgent}</span>
                <span className="kpi-foot">{urgent === 0 ? 'Nothing urgent right now' : 'Need someone to look today'}</span>
              </Link>
              <Link href="/actions" className="card kpi clickcard no-underline hover:no-underline">
                <span className="kpi-tag">Things to fix</span>
                <span className="kpi-val">{open}</span>
                <span className="kpi-foot">The top 5 are listed in order</span>
              </Link>
              <Link href="/reports" className="card kpi clickcard no-underline hover:no-underline">
                <span className="kpi-tag">Monthly report</span>
                <span className="kpi-val !text-[22px]">Download</span>
                <span className="kpi-foot">One PDF for this month</span>
              </Link>
            </div>
          </div>
        )}
      </Loader>
    </>
  );
}
