'use client';

import { useState } from 'react';
import { useBuyerLinks, useSend, useSession } from '@/api/queries';
import type { BuyerLink } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { formatDate } from '@/lib/format';

const BLANK = { name: '', email: '', person: '', kind: 'insurer' as BuyerLink['kind'], endsOn: '' };

/** Module 15: share the company's risk attestation with its insurer or acquirer, and stop at any time. */
export function SharingTab() {
  const links = useBuyerLinks();
  const send = useSend<BuyerLink & { invited: boolean; message?: string }>();
  const session = useSession().data;
  const [form, setForm] = useState(BLANK);
  const stop = useSend();
  const [stopped, setStopped] = useState('');  // its own request, so stopping never shows the share form's "Shared."
  const isAdmin = session?.role === 'admin';
  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <Card title="Share with your insurer" sub="Your insurer (or a company buying yours) sees your risk attestation, data integrity and exposure, never your contacts, numbers, findings or notes. Stop sharing at any time.">
      {isAdmin && (
        <form className="grid gap-3 md:grid-cols-[1fr_1.2fr_1fr_0.8fr_0.9fr_auto] md:items-end"
          onSubmit={(e) => { e.preventDefault(); setStopped(''); send.mutate({ method: 'POST', path: '/buyer-links', body: form }, { onSuccess: () => setForm(BLANK) }); }}>
          <div><label className="label" htmlFor="sh-name">Company</label><input id="sh-name" className="field" placeholder="Insurer or buyer name" value={form.name} onChange={set('name')} /></div>
          <div><label className="label" htmlFor="sh-email">Underwriter&apos;s email</label><input id="sh-email" type="email" className="field" placeholder="name@insurer.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })} /></div>
          <div><label className="label" htmlFor="sh-person">Their name</label><input id="sh-person" className="field" value={form.person} onChange={set('person')} /></div>
          <div><label className="label" htmlFor="sh-kind">They are</label>
            <select id="sh-kind" className="field" value={form.kind} onChange={set('kind')}><option value="insurer">Insurer</option><option value="acquirer">Acquirer</option></select></div>
          <div><label className="label" htmlFor="sh-ends">Until{form.kind === 'acquirer' ? '' : ' (optional)'}</label><input id="sh-ends" type="date" className="field" value={form.endsOn} onChange={set('endsOn')} /></div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!form.email.trim() || send.isPending}>Share</button>
        </form>
      )}
      {stopped && !send.isSuccess && <p className="tiny mb-0 mt-2" role="status">Stopped sharing with {stopped}.</p>}
      {send.isSuccess && <p className="tiny mb-0 mt-2" role="status">{send.data?.message || (send.data?.invited ? 'Shared. An invite to set a password was sent to them.' : 'Shared.')}</p>}
      {send.isError && <p className="tiny mb-0 mt-2 text-bad">{send.error.message}</p>}
      {!isAdmin && <p className="tiny m-0">Only an Admin can share or stop sharing.</p>}
      <Loader query={links}>
        {(d) => d.links.length === 0 ? <p className="tiny mb-0 mt-3">You don&apos;t share with anyone.</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Shared with</th><th>Since</th><th>Until</th><th>Status</th><th /></tr></thead>
              <tbody>{d.links.map((l) => (
                <tr key={l.id}>
                  <td className="font-semibold">{l.org}<div className="tiny">{l.kind === 'acquirer' ? 'Acquirer' : 'Insurer'} · shared by {l.grantedBy}</div></td>
                  <td>{formatDate(l.grantedOn)}</td><td>{l.endsOn ? formatDate(l.endsOn) : '—'}</td>
                  <td>{l.active ? <span className="pill pill-green">Sharing</span> : <span className="pill pill-gray">Stopped{l.stoppedOn ? ` ${formatDate(l.stoppedOn)}` : ''}</span>}</td>
                  <td className="text-right">{l.active && isAdmin && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { send.reset(); stop.mutate({ method: 'POST', path: `/buyer-links/${l.id}/revoke` }, { onSuccess: () => stop.reset() }); setStopped(l.org); }}>Stop sharing</button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Loader>
    </Card>
  );
}
