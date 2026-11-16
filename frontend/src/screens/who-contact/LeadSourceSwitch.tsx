'use client';

import type { CheckColumn, WhoFound, WhoLeadSource } from '@/api/types';
import { useSend } from '@/api/queries';
import { Toggle } from '@/components/ui/Toggle';

/** Client switch: was this vendor's or list's numbers checked against one list before they arrived? */
export function LeadSourceSwitch({ source, column, label, readOnly, disabled = false, found }: { source: WhoLeadSource; column: CheckColumn; label: string; readOnly: boolean; disabled?: boolean; found?: WhoFound }) {
  const send = useSend();
  const on = source.checked[column];
  // Beside what CiV found (owner 2026-11-16), the switch lists a check as done and says when the records do not match.
  const disagrees = on && (found?.tone === 'warn' || found?.tone === 'bad');
  const by = on ? source.markedBy?.[column] : null;
  const text = found
    ? <span className="tiny" style={disagrees ? { color: 'var(--bad-ink)', fontWeight: 600 } : undefined}>{on ? 'Listed as checked' : 'List as checked'}{disagrees ? ' · records don’t match' : ''}</span>
    : <span className="tiny" style={{ color: on ? 'var(--warn-ink)' : 'var(--bad-ink)' }}>{on ? 'Checked' : 'Not checked'}</span>;
  const byLine = by && <span className="tiny block">by {by}</span>;
  if (readOnly) return <span className="flex flex-col items-start gap-0.5">{text}{byLine}</span>;
  return (
    <span className="flex flex-col items-start gap-1">
    <span className="inline-flex items-center gap-2">
      <Toggle label={`${source.name}: ${label}`} checked={on} disabled={disabled} onChange={(next) => send.mutate({ method: 'PATCH', path: `/who-contact/${source.id}`, body: { column, checked: next } })} />
      {text}
    </span>
    {byLine}
    </span>
  );
}
