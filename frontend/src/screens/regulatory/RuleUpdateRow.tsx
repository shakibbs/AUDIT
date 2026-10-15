'use client';

import { useState } from 'react';
import { useSend } from '@/api/queries';
import type { RuleUpdateDraft } from '@/api/types';
import { formatDate } from '@/lib/format';

/** One new rule value a law change brings. A draft waits for CiV's approval; the company's lawyer may agree or disagree. */
export function RuleUpdateRow({ update: u, canReview }: { update: RuleUpdateDraft; canReview: boolean }) {
  const send = useSend();
  const [verdict, setVerdict] = useState<'agree' | 'disagree' | null>(null);
  const [comment, setComment] = useState('');
  const review = (v: 'agree' | 'disagree') => send.mutate({ method: 'POST', path: `/rule-updates/${u.id}/review`, body: { verdict: v, comment } },
    { onSuccess: () => setVerdict(null) });
  return (
    <div className="border-t border-line py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="mono text-[12px] font-semibold">{u.rule}</span>
          {u.isNewRule && <span className="pill pill-teal ml-2">New rule</span>}
          <span className="tiny"> · {u.place}</span>
          <div className="text-[13px]">New value: <b>{u.value}</b> from {formatDate(u.startsOn)}</div>
          {u.meaning && <div className="tiny">{u.meaning}</div>}
        </div>
        {u.state === 'draft' ? <span className="pill pill-amber" title="CiV has not approved it yet: it is not used">Draft</span> : <span className="pill pill-green">In the Rulebook</span>}
      </div>
      {u.myReview && <p className="tiny mb-0 mt-1">Your lawyer {u.myReview.by} {u.myReview.verdict === 'agree' ? 'agrees' : 'disagrees'}{u.myReview.comment && `: “${u.myReview.comment}”`}</p>}
      {canReview && u.state === 'draft' && (verdict === null
        ? <div className="mt-2 flex gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setVerdict('agree')}>{u.myReview ? 'Change review' : 'Review as our lawyer'}</button>
          </div>
        : <div className="mt-2 flex flex-col gap-2">
            <label className="label !mb-0" htmlFor={`c-${u.id}`}>Comment for CiV (optional)</label>
            <textarea id={`c-${u.id}`} className="field" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" className="btn btn-sm" onClick={() => review('agree')}>Agree</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => review('disagree')}>Disagree</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setVerdict(null)}>Cancel</button>
            </div>
            {send.error && <p className="tiny m-0" style={{ color: 'var(--bad-ink)' }}>{String(send.error.message)}</p>}
          </div>)}
    </div>
  );
}
