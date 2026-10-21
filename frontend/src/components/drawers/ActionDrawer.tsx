'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useActions, useSend, useSession, useUsers } from '@/api/queries';
import type { Action } from '@/api/types';
import { DomainCode } from '@/components/ui/DomainCode';
import { Drawer } from '@/components/ui/Drawer';
import { Seg } from '@/components/ui/Seg';
import { SeverityPill } from '@/components/ui/SeverityPill';
import { formatDate } from '@/lib/format';

const STATUSES = [{ id: 'open', label: 'Open' }, { id: 'in_progress', label: 'In progress' }, { id: 'resolved', label: 'Resolved' }] as const;
const DECISIONS = [{ id: 'accepted', label: 'Accepted' }, { id: 'declined', label: 'Declined' }, { id: 'alternative', label: 'Other plan' }] as const;
type Choice = (typeof DECISIONS)[number]['id'];

/** One action: the fix step, who owns it and by when, its status, and a note contesting the finding. */
export function ActionDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const action = useActions().data?.find((a) => a.id === id);
  const users = useUsers().data ?? [];
  const send = useSend();
  const session = useSession().data;
  const [note, setNote] = useState('');
  const [choice, setChoice] = useState<Choice>('accepted');
  const [reason, setReason] = useState('');
  if (!action) return <Drawer eyebrow="Action" title="Action" onClose={onClose}><p className="tiny">Loading…</p></Drawer>;

  const patch = (body: Partial<Action>) => send.mutate({ method: 'PATCH', path: `/actions/${action.id}`, body });
  const byCiv = action.owner === 'we';
  // Members can read; Admins and the company's lawyer change a finding (the server checks too).
  const locked = Boolean(session && session.role !== 'admin' && !session.isCounsel);
  return (
    <Drawer eyebrow={`Action ${action.rank} · ${byCiv ? 'CiV does this' : 'You do this'}`} title={action.title} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityPill severity={action.severity} /><DomainCode code={action.domain} /><span className="pill pill-teal">{action.impact}</span>
          {action.overdue && <span className="pill pill-red">Overdue</span>}
        </div>
        <div>
          <div className="kpi-tag mb-1.5">What was measured</div>
          <p className="m-0 text-[13px]">{action.why}</p>
          {action.since && <p className="tiny mb-0 mt-1.5">First found {formatDate(action.since)}{action.reopened ? ' · found again after it was resolved' : ''}{action.resolvedOn ? ` · resolved ${formatDate(action.resolvedOn)}` : ''}</p>}
        </div>
        {action.examples && action.examples.length > 0 && (
          <div>
            <div className="kpi-tag mb-1.5">Examples</div>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {action.examples.map((x) => <li key={x.ref}><Link className="mono text-[12.5px]" href={`/numbers/${encodeURIComponent(x.ref)}`} onClick={onClose}>{x.label}</Link></li>)}
            </ul>
          </div>
        )}
        <div>
          <div className="kpi-tag mb-1.5">Fix step</div>
          <p className="m-0 text-[13px]">{action.fixStep}</p>
          <p className="tiny mb-0 mt-1.5">{action.fixStepDraft && <span className="pill pill-amber mr-1.5">Draft · for your lawyers to review</span>}From the fix-step library. This describes a system change; it is not legal advice.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="assignee">Assigned to</label>
            <select id="assignee" className="field" disabled={byCiv || locked} value={action.assignee ?? ''} onChange={(e) => patch({ assignee: e.target.value || null })}>
              <option value="">Unassigned</option>
              {byCiv && <option value={action.assignee ?? ''}>{action.assignee}</option>}
              {users.filter((u) => u.status === 'active').map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="due">Due date</label>
            <input id="due" type="date" className="field" disabled={locked} value={action.due ?? ''} onChange={(e) => patch({ due: e.target.value || null })} />
          </div>
        </div>
        <div>
          <div className="label">Status</div>
          <Seg label="Status" options={STATUSES} value={action.status} onChange={(status) => { if (!locked) patch({ status }); }} />
        </div>
        {action.decision !== undefined && (
          <div className="border-t border-line pt-4">
            <div className="kpi-tag mb-1.5">Your decision</div>
            {action.decision && (
              <div className="note-box mb-2">
                <strong>{DECISIONS.find((d) => d.id === action.decision!.choice)?.label} · {action.decision.by}, {formatDate(action.decision.at)}.</strong> {action.decision.note}
              </div>
            )}
            {!locked && (
              <>
                <Seg label="Decision" options={DECISIONS} value={choice} onChange={setChoice} />
                <label className="sr-only" htmlFor="reason">Decision note</label>
                <textarea id="reason" className="field mt-2 min-h-[70px]" placeholder="Reviewed with [role]; decided [action] because [reason]." value={reason} onChange={(e) => setReason(e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => { patch({ decision: { choice, note: reason.trim(), by: '', at: '' } }); setReason(''); }}>Save decision</button>
                <p className="tiny mb-0 mt-1.5">Your note stays in your workspace and is never sent to insurers.</p>
              </>
            )}
          </div>
        )}
        <div className="border-t border-line pt-4">
          <div className="kpi-tag mb-1.5">Contest this finding</div>
          {action.dispute ? (
            <div className="note-box">
              <strong>Contested by {action.dispute.by} on {formatDate(action.dispute.at)}.</strong> {action.dispute.note}
              <div className="mt-1.5">The original finding is kept and both are shown in reports.</div>
            </div>
          ) : (
            <>
              <label className="sr-only" htmlFor="dispute">Note contesting the finding</label>
              <textarea id="dispute" className="field min-h-[84px]" placeholder="Say what the measurement missed. The original finding is kept and both are shown." value={note} onChange={(e) => setNote(e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm mt-2" disabled={!note.trim() || locked} onClick={() => patch({ dispute: { note: note.trim(), by: session?.name ?? 'You', at: '2026-09-30' } })}>Attach note</button>
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}
