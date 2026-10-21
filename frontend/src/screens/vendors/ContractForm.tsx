'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiUpload } from '@/api/client';
import { useSession } from '@/api/queries';
import type { Vendor, VendorContract } from '@/api/types';
import { formatDate } from '@/lib/format';

/** A vendor's contract: what is on file, and (Admins and the company's lawyer) a form to add a new one. */
export function ContractForm({ vendor }: { vendor: Vendor }) {
  const session = useSession().data;
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [endsOn, setEndsOn] = useState('');
  const [days, setDays] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const canAdd = Boolean(session && (session.role === 'admin' || session.isCounsel));
  const c = vendor.contract;

  async function save() {
    if (!file) return;
    const form = new FormData();
    form.append('vendor', vendor.name);
    form.append('file', file);
    if (endsOn) form.append('endsOn', endsOn);
    if (days) form.append('disputeDays', days);
    setBusy(true);
    setError('');
    try {
      await apiUpload<VendorContract>('/vendor-contracts', form);
      setFile(null);
      await client.invalidateQueries();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The contract could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="kpi-tag mb-2">Contract</div>
      {c ? (
        <p className="m-0 text-[13px]">
          <span className={`pill mr-2 ${c.state === 'on_file' ? 'pill-green' : 'pill-amber'}`}>{c.state === 'on_file' ? 'On file' : 'Expired'}</span>
          {c.url ? <a href={c.url} download>{c.file}</a> : c.file}
          {c.endsOn && <> · valid until {formatDate(c.endsOn)}</>}{c.disputeDays !== null && <> · {c.disputeDays} days to return a bad lead</>}
        </p>
      ) : <p className="tiny m-0">No contract on file.</p>}
      <p className="tiny mb-0 mt-1.5">Clauses are checked later by CiV&apos;s AI reader, against the draft list your lawyers review in the Rulebook.</p>
      {canAdd && (
        <div className="mt-3 flex flex-col gap-2">
          <label className="label" htmlFor="contract-file">Add contract</label>
          <input id="contract-file" type="file" className="field" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label" htmlFor="contract-end">Valid until</label><input id="contract-end" type="date" className="field" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} /></div>
            <div><label className="label" htmlFor="contract-days">Days to return a bad lead</label><input id="contract-days" type="number" min="0" className="field" value={days} onChange={(e) => setDays(e.target.value)} /></div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm self-start" disabled={!file || busy} onClick={save}>{busy ? 'Saving…' : 'Save contract'}</button>
          {error && <p className="tiny m-0 text-bad">{error}</p>}
        </div>
      )}
    </div>
  );
}
