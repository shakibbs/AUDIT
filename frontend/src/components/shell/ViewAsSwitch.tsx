'use client';

import { useRouter } from 'next/navigation';
import { useSend } from '@/api/queries';
import type { Session } from '@/api/types';

const OPTIONS = [{ id: 'owner', label: 'Owner' }, { id: 'underwriter', label: 'Underwriter' }] as const;

/** Sample data only: switch between the client owner's portal and what the insurer's underwriter sees. */
export function ViewAsSwitch({ session, onChosen }: { session: Session; onChosen?: () => void }) {
  const send = useSend();
  const router = useRouter();
  const current = session.view;
  function choose(id: (typeof OPTIONS)[number]['id']) {
    if (id === current) return onChosen?.();
    send.mutate({ method: 'POST', path: '/session/view-as', body: { view: id } }, { onSuccess: () => { router.push(id === 'underwriter' ? '/portfolio' : '/'); onChosen?.(); } });
  }
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 text-[13px]">
      <span className="kpi-tag">View as</span>
      <div className="seg" role="group" aria-label="View as">
        {OPTIONS.map((o) => <button key={o.id} type="button" aria-pressed={o.id === current} onClick={() => choose(o.id)}>{o.label}</button>)}
      </div>
    </div>
  );
}
