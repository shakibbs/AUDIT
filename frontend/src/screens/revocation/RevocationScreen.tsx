'use client';

import { useRevocation } from '@/api/queries';
import { Columns } from '@/components/charts/Columns';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { useDrawer } from '@/state/DrawerContext';
import { OptOutsCard } from './OptOutsCard';
import { RevocationMatrix } from './RevocationMatrix';
import { TestAuthorisation } from './TestAuthorisation';
import { WordingCoverage } from './WordingCoverage';
import { useMonth } from '@/state/PortalContext';

export function RevocationScreen() {
  const revocation = useRevocation(useMonth());
  const { open } = useDrawer();
  return (
    <>
      <PageHead eyebrow="Evidence" title="Revocation Integrity" sub="What happens when someone opts out: every real opt-out with its deadline, and how long each system takes to stop contacting." />
      <Loader query={revocation}>
        {(r) => (
          <div className="flex flex-col gap-5">
            <OptOutsCard />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi tag="Median time to stop" value={r.medianHours === null ? 'Not measured' : r.medianHours.toFixed(1)} unit={r.medianHours === null ? undefined : 'hours'} foot="Half of opt-outs stopped sooner" onClick={() => open('metric', 'M08')} />
              <Kpi tag="Slowest 10%" value={r.p90 === null ? 'Not measured' : String(r.p90)} foot="At least one path never stopped" info="The time by which 90% of opt-outs had stopped. NEVER means one in ten or more had not stopped when the deadline passed." />
              <Kpi tag="Not suppressed by deadline" value={String(r.notSuppressedByDeadline)} unit="opt-outs" foot={`Deadline: ${r.deadlineBusinessDays} business days`} />
              <Kpi tag="Contacted after deadline" value={String(r.contactedAfterDeadline)} unit="numbers" foot="A contact arrived after the deadline" />
            </div>
            <RevocationMatrix revocation={r} />
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Time to stop" sub="Opt-outs by how long contact continued">
                {r.distribution.length
                  ? <Columns label="Opt-outs by time to stop" columns={r.distribution.map((d) => ({ label: d.label, value: d.count, display: `${d.count} opt-outs`, flagged: d.label === 'Never' }))} />
                  : <p className="m-0 text-[13px] text-txt-2"><span className="pill pill-gray mr-2">Not measured</span>No opt-out checked in your tools yet.</p>}
                <p className="tiny mb-0 mt-3">The “Never” column is drawn in a second colour: those opt-outs had not stopped by the deadline.</p>
              </Card>
              <TestAuthorisation revocation={r} />
            </div>
            <WordingCoverage revocation={r} />
          </div>
        )}
      </Loader>
    </>
  );
}
