'use client';

import type { Session } from '@/api/types';
import { usePortal } from '@/state/PortalContext';

/** Page-wide notices: counsel-directed marking, and which month the page shows. */
export function Banners({ session }: { session: Session }) {
  const { period } = usePortal();
  const older = period && period !== session.periods[0]?.id ? session.periods.find((p) => p.id === period) : null;
  return (
    <>
      {session.engagementMode === 'counsel_directed' && (
        <div className="note-box mb-4" role="note">Prepared at the direction of counsel. Findings and alerts are delivered to the company’s lawyers only.</div>
      )}
      {older && (
        <div className="note-box mb-4" role="note">Showing <strong>{older.label}</strong> for scores, domains and metrics. Lists of contacts, actions and alerts always show the current state.</div>
      )}
    </>
  );
}
