'use client';

import type { CheckColumn } from '@/api/types';
import { useWhoNumbers } from '@/api/queries';
import { Drawer } from '@/components/ui/Drawer';
import { Loader } from '@/components/ui/Loader';
import { useMonth } from '@/state/PortalContext';

export interface OpenNumbers { source: string; name: string; column: CheckColumn; label: string }

const LIST: Record<CheckColumn, string> = { national: 'National DNC', state: 'State DNC', internal: 'Internal DNC', reassigned: 'Reassigned' };

/** The phone numbers behind a count on Who You Contact (owner 2026-11-16), masked; the first 100 with the total. */
export function NumbersDrawer({ open, onClose }: { open: OpenNumbers; onClose: () => void }) {
  const data = useWhoNumbers(open.source, open.column, useMonth());
  const total = data.data?.total;
  return (
    <Drawer eyebrow={`${open.name} · ${LIST[open.column]}`} title={total === undefined ? open.label : `${total.toLocaleString('en-US')} number${total === 1 ? '' : 's'} ${open.label}`} onClose={onClose}>
      <Loader query={data}>
        {(d) => (
          <>
            <p className="mb-4 text-[13px] text-txt-2">{open.column === 'internal'
              ? `Numbers on your do-not-contact list that were still contacted ${d.words}. Stop contacting them and check why your dialer did not block them.`
              : `Numbers contacted ${d.words} with no check in the 31 days before their first contact. Each number is listed once.`}</p>
            {d.rows.length === 0 ? <p className="text-[13px] text-txt-2">No numbers.</p> : (
              <table className="tbl">
                <thead><tr><th>Number</th><th>First contact</th><th>Channel</th></tr></thead>
                <tbody>
                  {d.rows.map((r, k) => (
                    <tr key={k}><td className="mono whitespace-nowrap">{r.number}</td><td className="whitespace-nowrap">{r.firstContact}<div className="tiny">{r.why}</div></td><td>{r.channel}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {d.total > d.rows.length && <p className="tiny mt-3">Showing the first {d.rows.length} of {d.total.toLocaleString('en-US')}.</p>}
          </>
        )}
      </Loader>
    </Drawer>
  );
}
