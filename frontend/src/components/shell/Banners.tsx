'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { Session } from '@/api/types';
import { formatDate, formatDateTime } from '@/lib/format';
import { usePortal } from '@/state/PortalContext';

const SCORED_PAGES = ['/', '/actions', '/reports'];

/** Page-wide notices: which month the page shows, a re-run after an upload, and when scores were worked out. */
export function Banners({ session }: { session: Session }) {
  const { period } = usePortal();
  const pathname = usePathname();
  const client = useQueryClient();
  const wasUpdating = useRef(Boolean(session.updating));
  useEffect(() => {  // the re-run finished: every page asks again, so new scores and findings show at once
    if (wasUpdating.current && !session.updating) void client.invalidateQueries();
    wasUpdating.current = Boolean(session.updating);
  }, [session.updating, client]);
  const older = period && period !== session.periods[0]?.id ? session.periods.find((p) => p.id === period) : null;
  const revised = session.periods.find((p) => p.id === (period ?? session.periods[0]?.id))?.revisedOn;
  return (
    <>
      {session.updating && (
        <div className="note-box mb-4" role="status">Updating your scores, findings and reports after your latest upload. This takes a few minutes; the page refreshes by itself.</div>
      )}
      {!session.updating && session.scoredAt && SCORED_PAGES.includes(pathname) && (
        <p className="tiny mb-3 mt-0">Scores, findings and reports last worked out {formatDateTime(session.scoredAt)} UTC.</p>
      )}
      {older && (
        <div className="note-box mb-4" role="note">Showing <strong>{older.label}</strong> for scores, domains and metrics. Lists of contacts, actions and alerts always show the current state.</div>
      )}
      {revised && (
        <div className="note-box mb-4" role="note">This month was revised on <strong>{formatDate(revised)}</strong> after late records or a rule change. The earlier version is kept.</div>
      )}
    </>
  );
}
