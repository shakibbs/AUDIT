'use client';

import { useState } from 'react';
import { useSend, useSession } from '@/api/queries';
import type { StatementRow } from '@/api/types';
import { formatDate } from '@/lib/format';

const TOPICS = [
  ['dnc_checked', 'We check every number against the National Do Not Call Registry'],
  ['internal_list', 'We never contact numbers on our internal do-not-call list'],
  ['optouts_honored', 'We stop contacting people who opt out'],
  ['consent_all', 'We have consent for every marketing contact'],
  ['other', 'Something else (write it below)'],
] as const;

/** Module 15: the company signs what it states about itself; its insurer sees it under "Insured states", never scored up. */
export function StatementForm({ rows }: { rows: StatementRow[] }) {
  const session = useSession().data;
  const send = useSend();
  const [topic, setTopic] = useState<string>(TOPICS[0][0]);
  const [text, setText] = useState('');
  const canSign = Boolean(session && (session.role === 'admin' || session.isCounsel));
  return (
    <div className="mt-3 border-t border-line-2 pt-3">
      {rows.length > 0 && (
        <ul className="m-0 mb-3 list-none space-y-1 p-0 text-[12.5px]">
          {rows.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-2">
              <span>“{r.text}” <span className="tiny">signed by {r.signedBy}, {formatDate(r.signedOn)}{r.note ? ` · ${r.note}` : ''}</span></span>
              {canSign && <button type="button" className="btn btn-ghost btn-sm" onClick={() => send.mutate({ method: 'POST', path: `/statements/${r.id}/withdraw` })}>Withdraw</button>}
            </li>
          ))}
        </ul>
      )}
      {canSign ? (
        <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); send.mutate({ method: 'POST', path: '/statements', body: { topic, text } }, { onSuccess: () => setText('') }); }}>
          <label className="label" htmlFor="st-topic">Add a statement</label>
          <select id="st-topic" className="field" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          {topic === 'other' && <textarea id="st-text" aria-label="Statement" className="field min-h-[60px]" placeholder="e.g. All our calling runs through Five9." value={text} onChange={(e) => setText(e.target.value)} />}
          <button type="submit" className="btn btn-primary btn-sm self-start" disabled={send.isPending || (topic === 'other' && !text.trim())}>Sign and add</button>
          <p className="tiny m-0">Signed with your name and today&apos;s date. Your insurer sees it as “Insured states”; it never raises a score, and CiV shows any conflict with what it measured.</p>
        </form>
      ) : <p className="tiny m-0">Only an Admin or your lawyer can sign statements.</p>}
      {send.isError && <p className="tiny m-0 mt-1 text-bad">{send.error.message}</p>}
    </div>
  );
}
