'use client';

import { useSend, useSession } from '@/api/queries';
import type { Readiness } from '@/api/types';
import { Meter } from '@/components/charts/Meter';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';

/** The one-time facts only you can give. Outstanding items come first. */
export function ChecklistTab({ readiness }: { readiness: Readiness }) {
  const send = useSend();
  const admin = useSession().data?.role === 'admin';  // only the company's Admin ticks setup rows (owner, 2026-10-23)
  const done = readiness.setup.filter((s) => s.done).length;
  const items = [...readiness.setup].sort((a, b) => Number(a.done) - Number(b.done));
  return (
    <Card title="Setup checklist" sub={`${done} of ${readiness.setup.length} complete${admin ? '' : ' · only your Admin can tick these'}`} flush>
      <div className="px-[22px] pb-4"><Meter label="Setup items complete" value={done} limit={readiness.setup.length} /></div>
      {items.map((item) => (
        <div key={item.id} className="row-item">
          <Toggle label={`${item.label} complete`} checked={item.done} onChange={(next) => send.mutate({ method: 'PATCH', path: `/setup/${item.id}`, body: { done: next } })} disabled={!admin} />
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold">{item.label}</div>
            <div className="tiny">{item.detail}</div>
          </div>
          <span className="text-[12.5px] text-txt-2">{item.count}</span>
          <span className={`pill ${item.done ? 'pill-green' : 'pill-amber'}`}>{item.done ? 'Complete' : 'Outstanding'}</span>
        </div>
      ))}
    </Card>
  );
}
