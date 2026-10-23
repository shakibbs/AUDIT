'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePosition } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

/** Enter a number and a date; get everything on record for that number as of that date. */
export function PositionLookup() {
  // Empty until the client asks: nothing is looked up on opening the page.
  const [form, setForm] = useState({ phone: '', date: new Date().toISOString().slice(0, 10) });
  const [asked, setAsked] = useState({ phone: '', date: '' });
  const position = usePosition(asked.phone, asked.date);
  return (
    <Card title="Position lookup" sub="What was on record for a number on a given date">
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); setAsked(form); }}>
        <div><label className="label" htmlFor="pl-phone">Phone number</label><input id="pl-phone" className="field mono !w-[200px]" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div><label className="label" htmlFor="pl-date">Date</label><input id="pl-date" type="date" className="field !w-[170px]" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <button type="submit" className="btn btn-primary" disabled={!form.phone.trim() || !form.date}>Look up</button>
      </form>
      {position.isError && <p className="mb-0 mt-4 text-[13px] text-bad" role="alert">{position.error.message}</p>}
      {position.data && (
        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="font-semibold">{position.data.phone}</span><span className="text-txt-2">as of {formatDate(position.data.date)}</span>
            <span className={`pill ${position.data.insideCoverage ? 'pill-green' : 'pill-amber'}`}>{position.data.insideCoverage ? 'Inside the covered period' : 'Before the engagement · limited record'}</span>
          </div>
          <table className="tbl">
            <thead><tr><th>Item</th><th>On record</th><th>Source</th></tr></thead>
            <tbody>
              {position.data.rows.map((row) => (
                <tr key={row.label}><td className="whitespace-nowrap text-txt-2">{row.label}</td><td className="font-semibold">{row.value}</td><td className="mono text-[11.5px] text-txt-2">{row.source}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="tiny mb-0 mt-3">
            {position.data.ref
              ? <Link href={`/numbers/${encodeURIComponent(position.data.ref)}`}>Open the full evidence file for this number</Link>
              : 'CiV has no contacts with this number, so there is no full evidence file.'}
          </p>
        </div>
      )}
    </Card>
  );
}
