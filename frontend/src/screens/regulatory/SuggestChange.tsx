'use client';

import { useState } from 'react';
import { useSend } from '@/api/queries';
import { Card } from '@/components/ui/Card';

const EMPTY = { title: '', jurisdiction: '', summary: '', source: '', sourceUrl: '' };

/** The company's lawyer tells CiV about a law change it may have missed. Only CiV sees it; CiV decides. */
export function SuggestChange() {
  const send = useSend();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const submit = () => send.mutate({ method: 'POST', path: '/reg-changes/suggest', body: form }, { onSuccess: () => { setSent(true); setOpen(false); setForm(EMPTY); } });
  return (
    <Card title="Suggest a change" sub="As your company's lawyer, tell CiV about a law, order or ruling we should add. Only CiV sees it."
      right={!open && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(true); setSent(false); }}>Suggest a change</button>}>
      {sent && !open && <p className="m-0 text-[13px]">Thank you. CiV received it and will add it if it applies.</p>}
      {open && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="s-title">What changed</label><input id="s-title" className="field" value={form.title} onChange={set('title')} /></div>
          <div><label className="label" htmlFor="s-place">Where</label><input id="s-place" className="field" placeholder="e.g. Florida, Federal · FCC" value={form.jurisdiction} onChange={set('jurisdiction')} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="s-summary">Summary</label><textarea id="s-summary" className="field" rows={3} value={form.summary} onChange={set('summary')} /></div>
          <div><label className="label" htmlFor="s-source">Source</label><input id="s-source" className="field" placeholder="e.g. Florida HB 1" value={form.source} onChange={set('source')} /></div>
          <div><label className="label" htmlFor="s-url">Link (optional)</label><input id="s-url" className="field" type="url" value={form.sourceUrl} onChange={set('sourceUrl')} /></div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="button" className="btn btn-sm" disabled={!form.title || !form.jurisdiction || !form.summary || send.isPending} onClick={submit}>Send to CiV</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
          {send.error && <p className="tiny m-0 sm:col-span-2" style={{ color: 'var(--bad-ink)' }}>{String(send.error.message)}</p>}
        </div>
      )}
    </Card>
  );
}
