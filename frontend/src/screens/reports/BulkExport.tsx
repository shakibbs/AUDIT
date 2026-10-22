'use client';

import { useState } from 'react';
import { ApiError } from '@/api/client';
import { useSend, useSession } from '@/api/queries';
import { Card } from '@/components/ui/Card';

const MAX = 25;

// Module 14: with the backend, the box downloads a ZIP of evidence files (and the certification pack); without it,
// it records the request as before.
async function downloadBundle(numbers: string[], pack: boolean): Promise<string> {
  const token = document.cookie.split('; ').find((c) => c.startsWith('csrftoken='))?.slice('csrftoken='.length) ?? '';
  const reply = await fetch('/api/evidence-bundle', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': token }, body: JSON.stringify({ numbers, pack }) });
  if (!reply.ok) {
    const body = await reply.json().catch(() => ({}));
    throw new ApiError(reply.status, (body as { detail?: string }).detail ?? 'The export could not be made.');
  }
  const blob = await reply.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = pack ? 'certification-pack.zip' : 'evidence-files.zip';
  link.click();
  URL.revokeObjectURL(link.href);
  const missing = Number(reply.headers.get('X-Not-Found') ?? 0);
  return missing ? `Downloaded. ${missing} number${missing === 1 ? '' : 's'} not found in CiV's records (listed in the ZIP).` : 'Downloaded.';
}

/** Export evidence files for a list of numbers in one request. */
export function BulkExport({ period }: { period: string }) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const send = useSend();
  const session = useSession().data;
  const canExport = Boolean(session && (session.role === 'admin' || session.isCounsel));  // Admins and the lawyer (owner, 2026-10-22)
  const numbers = text.split(/[\s,;]+/).filter((n) => n.replace(/\D/g, '').length >= 10);
  const tooMany = numbers.length > MAX;

  async function exportFiles(pack: boolean) {
    setBusy(true);
    setMessage('');
    try {
      setMessage(await downloadBundle(numbers, pack));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        send.mutate({ method: 'POST', path: '/reports', body: { name: `Evidence file export · ${numbers.length} ${numbers.length === 1 ? 'number' : 'numbers'}`, period } });
      } else {
        setMessage(e instanceof Error ? e.message : 'The export could not be made.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Bulk evidence export" sub="Paste phone numbers, one per line">
      <label className="sr-only" htmlFor="bulk">Phone numbers</label>
      <textarea id="bulk" className="field mono min-h-[110px]" placeholder={'+14805550923\n+19165554471'} value={text} onChange={(e) => { setText(e.target.value); send.reset(); setMessage(''); }} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" disabled={numbers.length === 0 || tooMany || send.isPending || busy || !canExport}
          onClick={() => exportFiles(false)}>Export {numbers.length || ''} {numbers.length === 1 ? 'file' : 'files'}</button>
        <button type="button" className="btn btn-ghost" disabled={numbers.length === 0 || tooMany || busy || !canExport} onClick={() => exportFiles(true)}>With certification pack</button>
        {!canExport && <span className="tiny">Only an Admin or your lawyer can export evidence.</span>}
        <span className="tiny" role="status">{tooMany ? `Up to ${MAX} numbers at a time.` : message || (send.isSuccess ? 'Queued. It will appear in the history below when ready.' : `${numbers.length} valid ${numbers.length === 1 ? 'number' : 'numbers'} recognised`)}</span>
      </div>
      <p className="tiny mb-0 mt-2">Numbers are turned into phone codes in memory and never stored. The certification pack adds the fingerprint list, how CiV captures records, how to check a fingerprint, and a custodian declaration draft for your lawyer.</p>
    </Card>
  );
}
