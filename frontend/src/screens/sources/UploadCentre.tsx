'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiUpload } from '@/api/client';
import { useSession, useUploads } from '@/api/queries';
import type { Source } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Loader } from '@/components/ui/Loader';
import { formatCount, formatDateTime, truncateHash } from '@/lib/format';
import { useMonth } from '@/state/PortalContext';

// Policies and contracts may also be documents; every other source is a CSV of rows.
const DOCUMENTS_OK = 'Policies, training, contracts';

/** Upload a file for a source that accepts uploads; shows the fingerprint recorded for each file. */
export function UploadCentre({ sources }: { sources: Source[] }) {
  const accepting = sources.filter((s) => s.acceptsUpload);
  const session = useSession().data;
  const canUpload = Boolean(session && (session.role === 'admin' || session.isCounsel));  // Admins and the lawyer (owner, 2026-10-22)
  const [source, setSource] = useState(accepting.find((s) => s.status === 'not_supplied')?.name ?? accepting[0]?.name ?? '');
  const [file, setFile] = useState<File | null>(null);
  const uploads = useUploads(useMonth());
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');  // "Uploaded …" after each file (QA 2026-10-23)

  // The file itself goes to CiV, which fingerprints it, keeps it write-once and reads its rows.
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError('');
    setDone('');
    try {
      const form = new FormData();
      form.append('source', source);
      form.append('file', file);
      const saved = await apiUpload<{ fileName: string; rowsRead: number; rowsRejected: number }>('/uploads', form);
      await client.invalidateQueries();
      setFile(null);
      setDone(`Uploaded ${saved.fileName}: ${saved.rowsRead} rows read${saved.rowsRejected ? `, ${saved.rowsRejected} not read` : ''}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The file could not be uploaded.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Upload centre" sub="Each file is fingerprinted on arrival and stored write-once" flush>
      <form className="flex flex-wrap items-end gap-3 px-[22px] pb-4" onSubmit={submit}>
        <div><label className="label" htmlFor="up-source">What is this file?</label>
          <select id="up-source" className="field !w-[260px]" value={source} onChange={(e) => setSource(e.target.value)}>
            {accepting.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select></div>
        <div className="min-w-[220px] flex-1">
          <span className="label">File (CSV)</span>
          <label className="field flex cursor-pointer items-center gap-2 !border-dashed text-txt-2">
            <Icon name="upload" /><span className="truncate">{file ? file.name : 'Choose a file'}</span>
            <input type="file" accept={source === DOCUMENTS_OK ? '.csv,text/csv,.pdf,.doc,.docx' : '.csv,text/csv'} className="sr-only" aria-label="File to upload" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={!file || busy || !canUpload}>{busy ? 'Uploading…' : 'Upload'}</button>
        {!canUpload && <span className="tiny">Only an Admin or your lawyer can upload.</span>}
        {error && <div className="tiny w-full" style={{ color: 'var(--bad-ink)' }}>{error}</div>}
        {done && !error && <div className="tiny w-full" role="status">{done}</div>}
      </form>
      <Loader query={uploads}>
        {(list) => (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>File</th><th>Source</th><th>Received (UTC)</th><th>Fingerprint</th><th>Rows read</th><th>Rows not read</th></tr></thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.artifactId}>
                    <td className="font-semibold">{u.fileName}<div className="tiny mono">{u.artifactId}</div></td>
                    <td className="text-txt-2">{u.source}</td>
                    <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(u.receivedAt)}</td>
                    <td className="mono text-[11.5px]" title={u.sha256}>{truncateHash(u.sha256)}</td>
                    <td className="mono">{formatCount(u.rowsRead)}</td>
                    <td className="mono">{u.rowsRejected > 0 ? <span className="pill pill-amber">{u.rowsRejected}</span> : '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Loader>
    </Card>
  );
}
