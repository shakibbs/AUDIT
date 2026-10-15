import type { CallingWindow } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { VerdictPill } from '@/components/ui/VerdictPill';

/** When this person may be called, in their own time, and whether right now is inside it. Advice only. */
export function CallingWindowCard({ window: w, where, confidence }: { window: CallingWindow; where?: string; confidence?: string }) {
  return (
    <Card title="Calling window" sub={`${where ?? ''}${confidence ? ` · location confidence ${confidence}` : ''}`} right={<VerdictPill verdict={w.verdict} />}>
      <dl className="m-0">
        <div className="kv"><dt>Allowed hours, their time</dt><dd>{w.hours ?? 'Not set yet'}{w.place && <span className="tiny"> · {w.place} rule</span>}</dd></div>
        {w.zones.map((z) => (
          <div key={z.zone} className="kv"><dt>Now in {z.zone.split('/').pop()?.replace('_', ' ')}</dt>
            <dd>{z.localTime} {z.allowed ? <span className="pill pill-green">inside</span> : <span className="pill pill-red">outside</span>}</dd></div>
        ))}
        <div className="kv"><dt>Holidays</dt><dd className="font-normal text-txt-2">{w.holidays}</dd></div>
      </dl>
      {w.note && <p className="tiny mb-0 mt-3">{w.note}</p>}
    </Card>
  );
}
