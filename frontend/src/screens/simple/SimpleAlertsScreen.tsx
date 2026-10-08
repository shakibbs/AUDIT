'use client';

import { useAlerts, useSend } from '@/api/queries';
import { SeeFullDetails } from '@/components/shell/SeeFullDetails';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatDateTime } from '@/lib/format';

/** Simple view alerts: only the urgent ones, in plain words. */
export function SimpleAlertsScreen() {
  const alerts = useAlerts();
  const send = useSend();
  return (
    <>
      <PageHead eyebrow="Simple view" title="Urgent alerts" sub="Only the alerts that need someone to look today.">
        <SeeFullDetails href="/alerts" label="See all alerts" />
      </PageHead>
      <Loader query={alerts}>
        {(list) => {
          const urgent = list.filter((a) => a.severity === 'High').sort((a, b) => Number(a.reviewed) - Number(b.reviewed) || b.at.localeCompare(a.at));
          return (
            <Card title={`${urgent.filter((a) => !a.reviewed).length} need attention`} sub="Newest first" flush>
              {urgent.length === 0 ? <Empty>Nothing urgent right now.</Empty> : urgent.map((a) => (
                <div key={a.id} className="row-item !items-start">
                  <span className="pill pill-red mt-0.5">Urgent</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold">{a.title}</div>
                    <div className="mt-1 text-[13px] text-txt-2">{a.detail}</div>
                    <div className="tiny mt-1.5">{formatDateTime(a.at)} UTC</div>
                  </div>
                  {a.reviewed
                    ? <span className="pill pill-green">Seen</span>
                    : <button type="button" className="btn btn-ghost btn-sm" onClick={() => send.mutate({ method: 'POST', path: `/alerts/${a.id}/review` })}>Mark as seen</button>}
                </div>
              ))}
            </Card>
          );
        }}
      </Loader>
    </>
  );
}
