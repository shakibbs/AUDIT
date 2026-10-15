'use client';

import { useState } from 'react';
import { useCanCall } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { VerdictPill } from '@/components/ui/VerdictPill';

/** "Can I call now?": type a number, see where the person probably is and whether now is inside their hours.
 * The number is used for this one check and not stored. Advice only: CiV does not block calls. */
export function CanCallBox() {
  const [number, setNumber] = useState('');
  const check = useCanCall();
  const r = check.data;
  return (
    <Card title="Can I call now?" sub="Type a number: CiV checks the person's local time against the calling hours. The number is not stored.">
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); check.mutate(number); }}>
        <label className="sr-only" htmlFor="can-call">Phone number</label>
        <input id="can-call" className="field !w-56" placeholder="(850) 555-0102" value={number} onChange={(e) => setNumber(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={!number || check.isPending}>Check</button>
      </form>
      {check.error && <p className="tiny mb-0 mt-3" style={{ color: 'var(--bad-ink)' }}>{check.error.message}</p>}
      {r && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2"><span className="mono font-semibold">{r.number}</span><VerdictPill verdict={r.verdict} />
            <span className="tiny">{r.state || r.country} · location confidence {r.confidence}</span></div>
          {r.hours && <p className="mb-0 mt-2 text-[13px]">Allowed {r.hours} their time{r.draft ? ' (draft)' : ''}.</p>}
          {r.zones.map((z) => (
            <div key={z.zone} className="tiny mt-1">{z.zone.split('/').pop()?.replace('_', ' ')}: now {z.localTime} · {z.allowed ? 'inside' : 'outside'}</div>
          ))}
          {r.note && <p className="tiny mb-0 mt-2">{r.note}</p>}
        </div>
      )}
    </Card>
  );
}
