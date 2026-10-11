'use client';

import type { CheckColumn, WhoLeadSource } from '@/api/types';
import { useSend } from '@/api/queries';
import { Toggle } from '@/components/ui/Toggle';

/** Client switch: was this vendor's or list's numbers checked against one list before they arrived? */
export function LeadSourceSwitch({ source, column, label, readOnly }: { source: WhoLeadSource; column: CheckColumn; label: string; readOnly: boolean }) {
  const send = useSend();
  const on = source.checked[column];
  const text = <span className="tiny" style={{ color: on ? 'var(--warn-ink)' : 'var(--bad-ink)' }}>{on ? 'Checked' : 'Not checked'}</span>;
  if (readOnly) return text;
  return (
    <span className="inline-flex items-center gap-2">
      <Toggle label={`${source.name}: ${label}`} checked={on} onChange={(next) => send.mutate({ method: 'PATCH', path: `/who-contact/${source.id}`, body: { column, checked: next } })} />
      {text}
    </span>
  );
}
