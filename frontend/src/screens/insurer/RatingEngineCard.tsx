'use client';

import { useState } from 'react';
import { useRatingEngine, useSend } from '@/api/queries';
import type { RatingEngine } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

/** Module 15: the insurer types where its pricing software takes the sheet, and its key (locked, never shown again). */
export function RatingEngineCard() {
  const engine = useRatingEngine().data;
  const send = useSend<RatingEngine>();
  const [url, setUrl] = useState<string | null>(null);
  const [key, setKey] = useState('');
  const [monthly, setMonthly] = useState<boolean | null>(null);
  if (!engine) return null;
  const shownUrl = url ?? engine.url;
  const shownMonthly = monthly ?? engine.monthly;
  return (
    <Card title="Your rating engine" sub="Where “Send to rating engine” delivers the sheet">
      <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); send.mutate({ method: 'POST', path: '/rating-engine', body: { url: shownUrl, key, monthly: shownMonthly } }, { onSuccess: () => { setKey(''); setUrl(null); setMonthly(null); } }); }}>
        <label className="label" htmlFor="re-url">Address (https)</label>
        <input id="re-url" className="field" placeholder="https://rating.yourcompany.com/civ" value={shownUrl} onChange={(e) => setUrl(e.target.value)} />
        <label className="label" htmlFor="re-key">Key</label>
        <input id="re-key" type="password" autoComplete="off" className="field" placeholder={engine.keyHint ? `Saved, ends in ${engine.keyHint}. Type a new one to replace it.` : 'The key your rating engine gave you'} value={key} onChange={(e) => setKey(e.target.value)} />
        <label className="flex items-center gap-2 text-[12.5px]"><input type="checkbox" checked={shownMonthly} onChange={(e) => setMonthly(e.target.checked)} /> Send every month on its own (the 6th, after the month is locked)</label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary btn-sm" disabled={send.isPending}>Save</button>
          {engine.url && <button type="button" className="btn btn-ghost btn-sm" onClick={() => send.mutate({ method: 'DELETE', path: '/rating-engine' })}>Remove</button>}
        </div>
        {send.isError && <p className="tiny m-0 text-bad">{send.error.message}</p>}
      </form>
      <p className="tiny mb-0 mt-3">The key is locked when saved and never shown again. Each sheet is signed (HMAC-SHA256 with your key) so your system can check it came from CiV unchanged. Every send shows in the company’s access log.</p>
      {engine.sends.length > 0 && (
        <ul className="m-0 mt-3 list-none space-y-1 p-0 text-[12.5px]">
          {engine.sends.map((s) => <li key={s.at + s.company}>{formatDate(s.at)} · {s.company} · <span style={{ color: s.ok ? undefined : 'var(--bad-ink)' }}>{s.detail}</span> <span className="tiny">({s.by})</span></li>)}
        </ul>
      )}
    </Card>
  );
}
