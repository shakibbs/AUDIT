'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiSend, apiUpload } from '@/api/client';
import type { ProofRequest } from '@/api/types';
import { formatDate } from '@/lib/format';

const TYPES = [['signed_form', 'Signed form or contract'], ['recording', 'Call recording'], ['email', 'Email or message'], ['other', 'Other']] as const;

function state(r: ProofRequest): [string, string] {
  if (r.answer === 'none') return ['pill-gray', 'You have none'];
  if (r.answer === 'proof' && r.review === 'valid') return ['pill-green', 'Checked: valid'];
  if (r.answer === 'proof' && r.review === 'invalid') return ['pill-red', 'Checked: not valid'];
  if (r.answer === 'proof') return ['pill-amber', 'Proof attached · CiV checking'];
  return new Date(r.dueAt) < new Date() ? ['pill-red', 'Overdue'] : ['pill-gray', `Due ${formatDate(r.dueAt)}`];
}

/** One number to prove: its state, and (for Admins and your lawyer) attach a file or say you have none. */
export function ProofRequestRow({ request, canAnswer }: { request: ProofRequest; canAnswer: boolean }) {
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<string>('signed_form');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pill, label] = state(request);
  const open = canAnswer && !request.review;

  async function send(none: boolean) {
    setBusy(true);
    setError('');
    try {
      if (none) {
        await apiSend('POST', `/proof-requests/${request.id}/answer`, { none: true });
      } else if (file) {
        const form = new FormData();
        form.append('file', file);
        form.append('fileType', kind);
        await apiUpload(`/proof-requests/${request.id}/answer`, form);
      }
      await client.invalidateQueries();
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr>
      <td className="mono whitespace-nowrap">{request.number}</td>
      <td className="tiny">{request.list}</td>
      <td>
        <span className={`pill ${pill}`}>{label}</span>
        {request.fileName && <div className="tiny mt-1">{request.fileType} · {request.fileUrl ? <a href={request.fileUrl}>{request.fileName}</a> : request.fileName}</div>}
        {request.reviewNote && <div className="tiny">{request.reviewNote}</div>}
      </td>
      <td className="min-w-[260px]">
        {open ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor={`file-${request.id}`}>Proof file for {request.number}</label>
            <input id={`file-${request.id}`} type="file" className="text-[12px]" accept=".pdf,.jpg,.jpeg,.png,.heic,.mp3,.wav,.m4a,.eml,.msg,.txt,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <label className="sr-only" htmlFor={`kind-${request.id}`}>What the file is</label>
            <select id={`kind-${request.id}`} className="field !w-auto !py-1 text-[12px]" value={kind} onChange={(e) => setKind(e.target.value)}>
              {TYPES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
            <button type="button" className="btn btn-primary !min-h-[32px] !py-1" disabled={!file || busy} onClick={() => send(false)}>Attach proof</button>
            {request.answer !== 'none' && <button type="button" className="btn btn-ghost !min-h-[32px] !py-1" disabled={busy} onClick={() => send(true)}>We have none</button>}
            {error && <div className="tiny w-full" style={{ color: 'var(--bad-ink)' }}>{error}</div>}
          </div>
        ) : <span className="tiny">{canAnswer ? '—' : 'An Admin or your lawyer answers'}</span>}
      </td>
    </tr>
  );
}
