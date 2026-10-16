'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { OptOut } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Seg } from '@/components/ui/Seg';
import { formatDate, formatDateTime } from '@/lib/format';

type Filter = 'all' | 'open' | 'late' | 'contacted';
const FILTERS: { id: Filter; label: string }[] = [{ id: 'all', label: 'All' }, { id: 'open', label: 'Open' }, { id: 'late', label: 'Late' }, { id: 'contacted', label: 'Contacted after STOP' }];

/** Open = deadline not passed yet. Late = deadline passed while the dialer had not marked it, or contact came after it. */
const isOpen = (o: OptOut) => o.businessDaysLeft > 0;
const isLate = (o: OptOut) => !isOpen(o) && (o.dialerMarked === false || Boolean(o.contactsAfter?.afterDeadline));

function deadlineCell(o: OptOut) {
  if (isOpen(o)) return <><b>{formatDate(o.deadline)}</b><div className="tiny">{o.businessDaysLeft} business day{o.businessDaysLeft === 1 ? '' : 's'} left</div></>;
  return <><span className="mono">{formatDate(o.deadline)}</span><div className="tiny">passed</div></>;
}

/** The Opt-outs card's table: every opt-out with its deadline, whether the dialer marked it, and contacts after. */
export function OptOutsTable({ optOuts }: { optOuts: OptOut[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const rows = optOuts.filter((o) => filter === 'all' || (filter === 'open' && isOpen(o)) || (filter === 'late' && isLate(o)) || (filter === 'contacted' && o.contactsAfter));
  const provisional = optOuts.some((o) => o.deadlineProvisional);
  return (
    <Card title="Opt-outs" sub="Everyone who asked not to be contacted, newest first. Shown as soon as it happens." flush
      right={<Seg label="Show" options={FILTERS} value={filter} onChange={setFilter} />}>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Number</th><th>How</th><th>When</th><th>Deadline</th><th>Dialer marked</th><th>Contacted after</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className={o.phoneE164 ? 'clickrow' : undefined} onClick={o.phoneE164 ? () => router.push(`/numbers/${encodeURIComponent(o.phoneE164!)}`) : undefined}>
                <td className="mono font-semibold">{o.phoneDisplay}</td>
                <td>{o.how}{o.words && <div className="tiny">{o.words}</div>}</td>
                <td className="mono tiny">{formatDateTime(o.at)}</td>
                <td>{deadlineCell(o)}</td>
                <td>{o.dialerMarked === null ? <span className="tiny">Not checked yet</span> : o.dialerMarked ? <span className="pill pill-green">Yes</span> : <span className="pill pill-red">No: block it now</span>}</td>
                <td>{o.contactsAfter
                  ? <span className={`pill ${o.contactsAfter.afterDeadline ? 'pill-red' : 'pill-amber'}`}>
                      {o.contactsAfter.count} {o.contactsAfter.channel.toLowerCase()}{o.contactsAfter.count === 1 ? '' : 's'} · {o.contactsAfter.afterDeadline ? 'after the deadline' : 'before the deadline'}
                    </span>
                  : <span className="tiny">None</span>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="tiny">{optOuts.length ? 'Nothing here.' : 'No opt-outs yet.'}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="tiny m-0 px-[22px] py-3">Deadlines count business days in the time zone of the person contacted (see Rulebook → Calendar & hours){provisional ? '; the 10-day deadline is still Proposed, so deadlines are provisional' : ''}. Any contact after an opt-out is alerted at once.</p>
    </Card>
  );
}
