'use client';

import { useReports, useSend, useSession } from '@/api/queries';
import { SeeFullDetails } from '@/components/shell/SeeFullDetails';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatDate } from '@/lib/format';
import { usePortal } from '@/state/PortalContext';

/** Simple view reports: one button for this month's report, and the last few reports. */
export function SimpleReportsScreen() {
  const reports = useReports();
  const send = useSend();
  const { period } = usePortal();
  const periods = useSession().data?.periods ?? [];
  const label = (periods.find((p) => p.id === period) ?? periods[0])?.label ?? '';
  return (
    <>
      <PageHead eyebrow="Simple view" title="Reports" sub="Your monthly report as one PDF.">
        <SeeFullDetails href="/reports" label="See all reports and exports" />
      </PageHead>
      <div className="flex flex-col gap-5">
        <section className="card card-pad flex flex-wrap items-center gap-5">
          <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-brand-soft text-brand-ink"><Icon name="file" size={26} /></span>
          <div className="min-w-[220px] flex-1">
            <h2 className="text-[18px]">Monthly report · {label}</h2>
            <p className="mb-0 mt-1 text-[13px] text-txt-2">Your score, what changed, and the open problems, in one document.</p>
          </div>
          <button type="button" className="btn btn-primary" disabled={send.isPending || send.isSuccess}
            onClick={() => send.mutate({ method: 'POST', path: '/reports', body: { name: 'Period audit report', period: label } })}>
            <Icon name="download" /> {send.isSuccess ? 'Requested: it will appear below' : 'Get this month’s report'}
          </button>
        </section>
        <Loader query={reports}>
          {(r) => (
            <Card title="Recent reports" flush>
              {r.runs.slice(0, 4).map((run) => (
                <div key={run.id} className="row-item">
                  <Icon name="file" className="text-txt-3" />
                  <span className="flex-1"><span className="block text-[13.5px] font-semibold">{run.name}</span><span className="tiny">{run.period} · {formatDate(run.at)}</span></span>
                  {run.status === 'ready' ? <span className="pill pill-green">Ready</span> : <span className="pill pill-blue">Being prepared</span>}
                </div>
              ))}
            </Card>
          )}
        </Loader>
      </div>
    </>
  );
}
