'use client';

import { useWhoContact } from '@/api/queries';
import { Drawer } from '@/components/ui/Drawer';
import { SourceChip } from '@/screens/who-contact/SourceChip';
import { StateDot } from '@/screens/who-contact/StateDot';

/** One Who You Contact area: each check with its reason, and the masked contacts behind it. */
export function WhoAreaDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const area = useWhoContact().data?.areas.find((a) => a.id === id);
  if (!area) return <Drawer eyebrow="Who you contact" title="Area" onClose={onClose}><p className="tiny">Loading…</p></Drawer>;
  return (
    <Drawer eyebrow={area.law} title={area.title} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div>
          {area.checks.map((c) => (
            <div key={c.name} className="border-t border-line py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2"><StateDot state={c.state} /><b>{c.name}</b></div>
                <b className="mono">{c.result}</b>
              </div>
              <p className="tiny mb-0 ml-4 mt-1">{c.why}</p>
              <div className="ml-4 mt-2 flex items-center gap-2"><SourceChip source={c.source} /><span className="mono tiny">{c.metric}</span></div>
            </div>
          ))}
        </div>
        {area.flags.length > 0 && (
          <div>
            <div className="kpi-tag mb-2">Contacts</div>
            <table className="tbl">
              <thead><tr><th>Number</th><th>Known</th><th>From</th><th>Flagged</th><th>Contacted</th></tr></thead>
              <tbody>
                {area.flags.map((f) => (
                  <tr key={f.number}><td className="mono">{f.number}</td><td>{f.known}</td><td className="tiny">{f.from}</td><td className="mono">{f.flaggedOn}</td><td className="mono font-semibold">{f.contactedOn}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="tiny mb-0 mt-2">Numbers are masked. Routed to counsel first.</p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
