'use client';

import { useRouter } from 'next/navigation';
import { useSend } from '@/api/queries';
import type { Session } from '@/api/types';

const OPTIONS = [{ id: 'owner', label: 'Owner' }, { id: 'underwriter', label: 'Underwriter' }] as const;

/** Sample data only: switch between the client owner's portal and what the insurer's underwriter sees. */
export function ViewAsSwitch({ session }: { session: Session }) {
  const send = useSend();
  const router = useRouter();
  const current = session.role === 'underwriter' ? 'underwriter' : 'owner';
  function choose(id: (typeof OPTIONS)[number]['id']) {
    if (id === current) return;
    send.mutate({ method: 'POST', path: '/session/view-as', body: { role: id } }, { onSuccess: () => router.push(id === 'underwriter' ? '/portfolio' : '/') });
  }
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[11px] font-semibold uppercase tracking-[0.08em] text-txt-3 xl:inline">View as</span>
      <div className="seg" role="group" aria-label="View as">
        {OPTIONS.map((o) => <button key={o.id} type="button" aria-pressed={o.id === current} onClick={() => choose(o.id)}>{o.label}</button>)}
      </div>
    </div>
  );
}
