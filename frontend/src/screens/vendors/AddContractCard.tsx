'use client';

import { useState } from 'react';
import { useSession, useVendorContracts } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';
import { useContractUpload } from './useContractUpload';

/** Add a contract for any vendor (picked from the list or typed), and the contracts already on file. */
export function AddContractCard({ vendorNames }: { vendorNames: string[] }) {
  const session = useSession().data;
  const contracts = useVendorContracts();
  const { busy, upload } = useContractUpload();
  const [vendor, setVendor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [endsOn, setEndsOn] = useState('');
  const [days, setDays] = useState('');
  const [message, setMessage] = useState('');
  const canAdd = Boolean(session && (session.role === 'admin' || session.isCounsel));
  const list = contracts.data ?? [];

  async function save() {
    if (!file || !vendor.trim()) return;
    setMessage('');
    try {
      const saved = await upload({ vendor, file, endsOn, disputeDays: days });
      setMessage(`Saved the contract for ${saved.vendor}.`);
      setVendor('');
      setFile(null);
      setEndsOn('');
      setDays('');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'The contract could not be saved.');
    }
  }

  return (
    <Card title="Vendor contracts" sub="Upload each vendor's signed terms. Clauses are checked later by CiV's AI reader against the draft list your lawyers review.">
      {canAdd && (
        <div className="grid gap-3 md:grid-cols-[1.2fr_1.4fr_0.9fr_0.9fr_auto] md:items-end">
          <div>
            <label className="label" htmlFor="ac-vendor">Vendor</label>
            <input id="ac-vendor" className="field" list="ac-vendors" placeholder="Pick or type a vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
            <datalist id="ac-vendors">{vendorNames.map((n) => <option key={n} value={n} />)}</datalist>
          </div>
          <div><label className="label" htmlFor="ac-file">Contract file</label><input id="ac-file" type="file" className="field" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div><label className="label" htmlFor="ac-end">Valid until</label><input id="ac-end" type="date" className="field" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} /></div>
          <div><label className="label" htmlFor="ac-days">Days to return a bad lead</label><input id="ac-days" type="number" min="0" className="field" value={days} onChange={(e) => setDays(e.target.value)} /></div>
          <button type="button" className="btn btn-primary btn-sm" disabled={!file || !vendor.trim() || busy} onClick={save}>{busy ? 'Saving…' : 'Add contract'}</button>
        </div>
      )}
      {message && <p className="tiny mb-0 mt-2">{message}</p>}
      {!canAdd && <p className="tiny m-0">Only an Admin or your company&apos;s lawyer can add a contract.</p>}
      {list.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Vendor</th><th>File</th><th>Valid until</th><th>Return window</th><th>Status</th><th>Added</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.vendor}</td>
                  <td>{c.url ? <a href={c.url} download>{c.file}</a> : c.file}</td>
                  <td>{c.endsOn ? formatDate(c.endsOn) : <span className="text-txt-3">No end date</span>}</td>
                  <td>{c.disputeDays === null ? <span className="text-txt-3">Not stated</span> : `${c.disputeDays} days`}</td>
                  <td><span className={`pill ${c.state === 'on_file' ? 'pill-green' : 'pill-amber'}`}>{c.state === 'on_file' ? 'On file' : 'Expired'}</span></td>
                  <td className="tiny">{c.uploadedBy}, {formatDate(c.uploadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
